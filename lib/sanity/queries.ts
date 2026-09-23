import type { Edit, MenEdit, Product, Department, Founder, Article, CityGuide, EditorialRef } from "../types";
import { sanityClient } from "./client";
import { urlForImage } from "./image";

// GROQ layer. Wired but dormant until NEXT_PUBLIC_SANITY_PROJECT_ID is set and
// content is published in the Studio (sanity/schemas). lib/content.ts switches
// to these once sanityEnabled is true.

const PRODUCT_PROJECTION = `{
  "slug": coalesce(slug.current, _id),
  brand,
  "name": productName,
  price,
  currency,
  primaryImage,
  department,
  "category": category->name,
  affiliateUrl,
  sourceUrl,
  network,
  gridSize,
  webExclusive,
  active
}`;

interface RawProduct {
  slug: string;
  brand: string;
  name: string;
  price: number;
  currency?: string;
  primaryImage?: unknown;
  department?: Department;
  category?: string;
  affiliateUrl: string;
  sourceUrl?: string;
  network: Product["network"];
  gridSize?: Product["gridSize"];
  webExclusive?: boolean;
  active?: boolean;
}

function mapProduct(r: RawProduct): Product {
  return {
    slug: r.slug,
    brand: r.brand,
    name: r.name,
    price: r.price,
    currency: r.currency ?? "EUR",
    image: r.primaryImage ? urlForImage(r.primaryImage as never) ?? undefined : undefined,
    department: r.department ?? "women",
    category: r.category,
    affiliateUrl: r.affiliateUrl,
    sourceUrl: r.sourceUrl,
    network: r.network,
    gridSize: r.gridSize ?? "1x1",
    webExclusive: r.webExclusive ?? false,
    active: r.active ?? true,
  };
}

export async function fetchCurrentEdit(): Promise<Edit | null> {
  if (!sanityClient) return null;
  const data = await sanityClient.fetch(
    `*[_type == "edit" && status == "published"] | order(publishDate desc)[0]{
      title, eyebrow, "issue": "Issue No. " + string(issueNumber), description,
      heroCollage,
      "products": featuredProducts[]->${PRODUCT_PROJECTION}
    }`
  );
  if (!data) return null;
  // Drop inactive (and any dangling/deleted) refs so a deactivated product can
  // never surface in the homepage edit.
  const products: Product[] = (data.products ?? [])
    .filter((p: RawProduct | null) => p && p.active !== false)
    .map(mapProduct);
  const lines = String(data.title ?? "").split(/\s*\n\s*|\s{2,}/);
  return {
    title: data.title,
    titleLines: [lines[0] ?? data.title, lines[1] ?? ""],
    eyebrow: data.eyebrow ?? "The Edit",
    issue: data.issue ?? "",
    description: data.description ?? "",
    collage: (data.heroCollage ?? []).map((img: unknown, i: number) => ({
      image: urlForImage(img as never) ?? "",
      alt: "",
      caption: "",
      num: String(i + 1).padStart(2, "0"),
    })),
    products: products.filter((p) => p.department !== "men"),
  };
}

// The N latest published edits, newest first — for the homepage carousel that
// lets a reader toggle between the two most recent edits (cover + products).
export async function fetchLatestEdits(limit = 2): Promise<Edit[]> {
  if (!sanityClient) return [];
  const rows = await sanityClient.fetch(
    `*[_type == "edit" && status == "published"] | order(publishDate desc){
      title, eyebrow, "issue": "Issue No. " + string(issueNumber), description,
      heroCollage, heroCoverMobile,
      "products": featuredProducts[]->${PRODUCT_PROJECTION},
      "sections": sections[]{ title, "products": products[]->${PRODUCT_PROJECTION} }
    }`
  );
  const activeMapped = (arr: (RawProduct | null)[] | undefined): Product[] =>
    (arr ?? [])
      .filter((p): p is RawProduct => p != null && p.active !== false)
      .map(mapProduct)
      .filter((p: Product) => p.department !== "men");
  return (rows ?? [])
    .slice(0, limit)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((data: any): Edit => {
      const products = activeMapped(data.products);
      const rawSections = (data.sections ?? []) as { title: string; products: (RawProduct | null)[] }[];
      const sections = rawSections
        .map((s) => ({ title: s.title, products: activeMapped(s.products) }))
        .filter((s) => s.products.length > 0);
      const lines = String(data.title ?? "").split(/\s*\n\s*|\s{2,}/);
      return {
        title: data.title,
        titleLines: [lines[0] ?? data.title, lines[1] ?? ""],
        eyebrow: data.eyebrow ?? "The Edit",
        issue: data.issue ?? "",
        description: data.description ?? "",
        collage: (data.heroCollage ?? []).map((img: unknown, i: number) => ({
          image: urlForImage(img as never) ?? "",
          alt: "",
          caption: "",
          num: String(i + 1).padStart(2, "0"),
        })),
        products,
        ...(sections.length > 0 ? { sections } : {}),
        ...(data.heroCoverMobile
          ? { mobileCover: urlForImage(data.heroCoverMobile as never) ?? undefined }
          : {}),
      };
    });
}

// Slugify an edit title (e.g. "Caftans Are Back" -> "caftans-are-back") so an
// edit can have its own page at /edit/[slug].
function slugifyTitle(t: string): string {
  return String(t)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// A single published edit by its title-slug, rendered on its own /edit/[slug]
// page (e.g. the "Caftans Are Back" edit moved off the homepage). Unlike the
// homepage edit, this keeps every featured product (no men filter).
export async function fetchEditBySlug(slug: string): Promise<Edit | null> {
  if (!sanityClient) return null;
  const rows = await sanityClient.fetch(
    `*[_type == "edit" && status == "published"]{
      title, eyebrow, "issue": "Issue No. " + string(issueNumber), description,
      heroCollage,
      "products": featuredProducts[]->${PRODUCT_PROJECTION},
      "sections": sections[]{ "products": products[]->${PRODUCT_PROJECTION} }
    }`
  );
  const data = (rows ?? []).find((r: { title: string }) => slugifyTitle(r.title) === slug);
  if (!data) return null;
  // Flat list for the /edit page. Grouped edits (e.g. Back to School) keep their
  // products in `sections` with no top-level featuredProducts, so flatten those.
  const rawProducts: (RawProduct | null)[] =
    (data.products ?? []).length > 0
      ? data.products
      : (data.sections ?? []).flatMap((s: { products: (RawProduct | null)[] }) => s.products ?? []);
  const products: Product[] = rawProducts
    .filter((p): p is RawProduct => p != null && p.active !== false)
    .map(mapProduct);
  const lines = String(data.title ?? "").split(/\s*\n\s*|\s{2,}/);
  return {
    title: data.title,
    titleLines: [lines[0] ?? data.title, lines[1] ?? ""],
    eyebrow: data.eyebrow ?? "The Edit",
    issue: data.issue ?? "",
    description: data.description ?? "",
    collage: (data.heroCollage ?? []).map((img: unknown, i: number) => ({
      image: urlForImage(img as never) ?? "",
      alt: "",
      caption: "",
      num: String(i + 1).padStart(2, "0"),
    })),
    products,
  };
}

export async function fetchMenEdit(): Promise<MenEdit | null> {
  if (!sanityClient) return null;
  // Filter by the Men category (not department) so any product an editor files
  // under Men shows here automatically — the paste-flow defaults department to
  // "women", so a department filter silently hid newly added men's items.
  const products = await sanityClient.fetch(
    `*[_type == "product" && category->slug.current == "men" && active != false] | order(_createdAt desc)${PRODUCT_PROJECTION}`
  );
  return {
    kicker: "Men",
    titleLines: ["Men", ""],
    dek: "",
    products: (products ?? []).map(mapProduct),
  };
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  if (!sanityClient) return null;
  // Resolve by slug OR document id, so a product that never got a slug is still
  // reachable (its card links to /go/<_id> via the coalesce in PRODUCT_PROJECTION).
  const r = await sanityClient.fetch(
    `*[_type == "product" && (slug.current == $slug || _id == $slug)][0]${PRODUCT_PROJECTION}`,
    { slug }
  );
  return r ? mapProduct(r) : null;
}

// Every active product, for the search index. Sanity-backed so the search covers
// the full live catalog (the seed list only had 16 items, so most items never
// surfaced) and each result carries its real Sanity CDN image.
export async function fetchAllProducts(): Promise<Product[]> {
  if (!sanityClient) return [];
  const rows = await sanityClient.fetch(
    `*[_type == "product" && active != false] | order(_createdAt desc)${PRODUCT_PROJECTION}`
  );
  return (rows ?? []).map(mapProduct);
}

// Lightweight {title, slug} for the nav's "What We Shop" menu column, newest first.
export async function fetchEditNavLinks(limit = 6): Promise<{ title: string; slug: string }[]> {
  if (!sanityClient) return [];
  const rows = await sanityClient.fetch(
    `*[_type == "edit" && status == "published" && defined(slug.current)] | order(publishDate desc){ title, "slug": slug.current }`
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (rows ?? []).slice(0, limit).map((r: any) => ({ title: r.title ?? "", slug: r.slug as string }));
}

export async function fetchProductsByCategory(slug: string): Promise<Product[]> {
  if (!sanityClient) return [];
  const rows = await sanityClient.fetch(
    `*[_type == "product" && active != false && category->slug.current == $slug] | order(_createdAt desc)${PRODUCT_PROJECTION}`,
    { slug }
  );
  return (rows ?? []).map(mapProduct);
}

export async function fetchFounders(): Promise<Founder[]> {
  if (!sanityClient) return [];
  const rows = await sanityClient.fetch(
    `*[_type == "editor"]{ name, role, "bio": coalesce(bio, "") } | order(name asc)`
  );
  return rows ?? [];
}

// Editorial cards for a section (Travel/Culture etc.): every published article and
// city guide filed under the category. Sanity-backed so guides/articles added in
// the Studio (e.g. the Palma guide) actually surface — the seed list was fixed.
export async function fetchEditorialsByCategory(catSlug: string): Promise<EditorialRef[]> {
  if (!sanityClient) return [];
  const rows = await sanityClient.fetch(
    `*[(_type == "article" || _type == "cityGuide") && category->slug.current == $cat && defined(slug.current)] | order(_createdAt desc){
      _type, "slug": slug.current,
      "title": select(_type == "cityGuide" => "10am in " + city, title),
      heroImage, "catName": category->name,
      "isCulture": category->slug.current == "culture"
    }`,
    { cat: catSlug }
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (rows ?? []).map((r: any): EditorialRef => ({
    kind: r._type === "cityGuide" ? "guide" : "article",
    slug: r.slug,
    title: r.title,
    image: r.heroImage ? urlForImage(r.heroImage) ?? "" : "",
    category: r.catName ?? "",
    kicker: r._type === "cityGuide" ? "A 10am city guide" : r.isCulture ? "A 10am culture note" : "A 10am editorial",
  }));
}

export async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  if (!sanityClient) return null;
  const a = await sanityClient.fetch(
    `*[_type == "article" && slug.current == $slug][0]{
      "slug": slug.current, title, titleHtml, "category": category->name, dek,
      heroImage, author, date, readingTime, body,
      sections[]{ kicker, heading, image, body, links[]{ label, url } },
      "shopThisStory": shopThisStory[]->${PRODUCT_PROJECTION}
    }`,
    { slug }
  );
  if (!a) return null;
  return {
    slug: a.slug,
    title: a.title,
    titleHtml: a.titleHtml ?? a.title,
    category: a.category ?? "",
    dek: a.dek ?? "",
    heroImage: a.heroImage ? urlForImage(a.heroImage) ?? "" : "",
    author: a.author ?? "",
    date: a.date ?? "",
    readingTime: a.readingTime ?? "",
    body: a.body ?? [],
    sections: (a.sections ?? []).map(
      (s: {
        kicker?: string;
        heading?: string;
        image?: unknown;
        body?: string[];
        links?: { label?: string; url?: string }[];
      }) => ({
        kicker: s.kicker ?? "",
        heading: s.heading ?? "",
        image: s.image ? urlForImage(s.image) ?? "" : "",
        body: s.body ?? [],
        links: (s.links ?? [])
          .filter((l) => l && l.url)
          .map((l) => ({ label: l.label ?? "Visit", url: l.url as string })),
      })
    ),
    shopThisStory: (a.shopThisStory ?? [])
      .filter((p: RawProduct | null) => p && p.active !== false)
      .map(mapProduct),
  };
}

export async function fetchCityGuideBySlug(slug: string): Promise<CityGuide | null> {
  if (!sanityClient) return null;
  const g = await sanityClient.fetch(
    `*[_type == "cityGuide" && slug.current == $slug][0]{
      "slug": slug.current, city, country, "category": category->name, heroImage, intro, gated,
      stay[]{name, blurb, affiliateUrl}, eat[]{name, blurb, affiliateUrl}, "do": do[]{name, blurb, affiliateUrl}, shop[]{name, blurb, affiliateUrl}, gallery
    }`,
    { slug }
  );
  if (!g) return null;
  return {
    slug: g.slug,
    city: g.city,
    country: g.country ?? "",
    category: g.category ?? "Travel",
    heroImage: g.heroImage ? urlForImage(g.heroImage) ?? "" : "",
    intro: g.intro ?? [],
    gated: g.gated ?? false,
    stay: g.stay ?? [],
    eat: g.eat ?? [],
    do: g.do ?? [],
    shop: g.shop ?? [],
    gallery: ((g.gallery as unknown[]) ?? []).map((img) => urlForImage(img) ?? "").filter(Boolean),
  };
}
