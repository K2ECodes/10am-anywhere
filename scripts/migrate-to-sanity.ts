/**
 * Seeds the Sanity dataset with the full content set so the founders can edit
 * everything in the Studio and the live site reflects it. Idempotent — run again
 * any time to re-sync:  npx tsx scripts/migrate-to-sanity.ts
 * Reads keys from .env.local (NEXT_PUBLIC_SANITY_PROJECT_ID, SANITY_API_WRITE_TOKEN).
 */
import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { join } from "path";
import {
  seedEdit,
  seedMenEdit,
  seedCategories,
  seedFounders,
  seedArticle,
  seedCityGuide,
  allSeedProducts,
} from "../lib/seed";

// Load .env.local (a standalone script does not get Next's env loading).
const envText = readFileSync(join(process.cwd(), ".env.local"), "utf8");
for (const line of envText.split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (!m) continue;
  let v = m[2].trim();
  if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
  if (!process.env[m[1]]) process.env[m[1]] = v;
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN!;
if (!projectId || !token) throw new Error("Missing Sanity project id or write token");

const client = createClient({ projectId, dataset, apiVersion: "2026-01-01", token, useCdn: false });
const PUBLIC = join(process.cwd(), "public");

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[^\x00-\x7F]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
async function uploadImage(imgPath: string) {
  const buf = readFileSync(join(PUBLIC, imgPath));
  const asset = await client.assets.upload("image", buf, { filename: imgPath.split("/").pop()! });
  return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
}
const productRef = (slug: string) => ({ _type: "reference", _ref: `product-${slug}`, _key: slug });
const places = (arr: { name: string; blurb: string; affiliateUrl?: string }[]) =>
  arr.map((p, i) => ({ _type: "place", _key: `p${i}`, name: p.name, blurb: p.blurb, affiliateUrl: p.affiliateUrl }));

async function main() {
  // Categories
  for (const c of seedCategories) {
    await client.createOrReplace({
      _id: `category-${c.slug}`,
      _type: "category",
      name: c.name,
      slug: { _type: "slug", current: c.slug },
      description: c.description,
    });
  }
  const catRef = (name?: string) => {
    const c = seedCategories.find((x) => x.name === name);
    return c ? { _type: "reference", _ref: `category-${c.slug}` } : undefined;
  };

  // Products (women, men, + Interior/Beauty/Culture samples)
  let imgCount = 0;
  for (const p of allSeedProducts) {
    const doc: Record<string, unknown> = {
      _id: `product-${p.slug}`,
      _type: "product",
      brand: p.brand,
      productName: p.name,
      slug: { _type: "slug", current: p.slug },
      price: p.price,
      currency: p.currency,
      department: p.department,
      affiliateUrl: p.affiliateUrl,
      network: p.network,
      gridSize: p.gridSize,
      active: p.active,
    };
    if (p.image) {
      doc.primaryImage = await uploadImage(p.image);
      imgCount++;
    }
    const cref = catRef(p.category);
    if (cref) doc.category = cref;
    await client.createOrReplace(doc);
    process.stdout.write(".");
  }

  // Editors (founders)
  for (const f of seedFounders) {
    await client.createOrReplace({
      _id: `editor-${slugify(f.name)}`,
      _type: "editor",
      name: f.name,
      role: f.role,
      bio: f.bio,
    });
  }

  // The published edit (homepage)
  await client.createOrReplace({
    _id: "edit-vacation-wardrobe",
    _type: "edit",
    title: "Vacation\nWardrobe",
    slug: { _type: "slug", current: "vacation-wardrobe" },
    issueNumber: 1,
    eyebrow: "The Edit",
    publishDate: new Date().toISOString(),
    description: seedEdit.description,
    heroVariant: "collage",
    featuredProducts: seedEdit.products.map((p) => productRef(p.slug)),
    status: "published",
  });

  // Article
  await client.createOrReplace({
    _id: `article-${seedArticle.slug}`,
    _type: "article",
    title: seedArticle.title,
    titleHtml: seedArticle.titleHtml,
    slug: { _type: "slug", current: seedArticle.slug },
    category: catRef(seedArticle.category),
    dek: seedArticle.dek,
    heroImage: await uploadImage(seedArticle.heroImage),
    author: seedArticle.author,
    date: seedArticle.date,
    readingTime: seedArticle.readingTime,
    body: seedArticle.body,
    shopThisStory: seedArticle.shopThisStory.map((p) => productRef(p.slug)),
    gated: false,
  });

  // City guide (Lisbon) with hero + gallery
  const gallery = [];
  for (const g of seedCityGuide.gallery) gallery.push({ ...(await uploadImage(g)), _key: slugify(g) });
  await client.createOrReplace({
    _id: `cityGuide-${seedCityGuide.slug}`,
    _type: "cityGuide",
    city: seedCityGuide.city,
    country: seedCityGuide.country,
    slug: { _type: "slug", current: seedCityGuide.slug },
    category: catRef(seedCityGuide.category),
    heroImage: await uploadImage(seedCityGuide.heroImage),
    intro: seedCityGuide.intro,
    gated: seedCityGuide.gated,
    stay: places(seedCityGuide.stay),
    eat: places(seedCityGuide.eat),
    do: places(seedCityGuide.do),
    shop: places(seedCityGuide.shop),
    gallery,
  });

  console.log(
    `\nDone: ${seedCategories.length} categories, ${allSeedProducts.length} products (${imgCount} imgs), ${seedFounders.length} editors, 1 edit, 1 article, 1 city guide.`
  );
}

main().catch((e) => {
  console.error("\nMigration failed:", e?.message || e);
  process.exit(1);
});
