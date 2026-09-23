/**
 * Patches each product's affiliateUrl in Sanity with a real retailer link.
 * Reads /tmp/links.json  (array of { slug, url }).
 *   npx tsx scripts/set-affiliate-links.ts
 */
import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { join } from "path";

const envText = readFileSync(join(process.cwd(), ".env.local"), "utf8");
for (const line of envText.split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (!m) continue;
  let v = m[2].trim();
  if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
  if (!process.env[m[1]]) process.env[m[1]] = v;
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2026-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN!,
  useCdn: false,
});

type Link = { slug: string; url: string };

async function main() {
  const links: Link[] = JSON.parse(readFileSync("/tmp/links.json", "utf8"));
  let ok = 0;
  for (const { slug, url } of links) {
    if (!/^https?:\/\//.test(url)) {
      console.error("skip (bad url):", slug, url);
      continue;
    }
    await client.patch(`product-${slug}`).set({ affiliateUrl: url }).commit();
    ok++;
    process.stdout.write(".");
  }
  console.log(`\nPatched ${ok}/${links.length} product affiliate links.`);
}

main().catch((e) => {
  console.error("\nFailed:", e?.message || e);
  process.exit(1);
});
