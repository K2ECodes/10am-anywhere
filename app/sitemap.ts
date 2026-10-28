import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { sanityEnabled } from "@/lib/sanity/client";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

const STATIC = ["", "/men", "/category/fashion", "/category/interior", "/category/beauty", "/category/culture", "/category/travel", "/the-editors", "/search"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const out: MetadataRoute.Sitemap = STATIC.map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: now,
    changeFrequency: p === "" ? "daily" : "weekly",
    priority: p === "" ? 1 : 0.7,
  }));
  if (!sanityEnabled) return out;
  try {
    const { fetchSiteIndex } = await import("@/lib/sanity/queries");
    const idx = await fetchSiteIndex();
    if (!idx) return out;
    idx.edits.forEach((e) => out.push({ url: `${SITE_URL}/edit/${e.slug}`, lastModified: new Date(e.updated), changeFrequency: "weekly", priority: 0.9 }));
    idx.articles.forEach((a) => out.push({ url: `${SITE_URL}/article/${a.slug}`, lastModified: new Date(a.updated), changeFrequency: "monthly", priority: 0.8 }));
    idx.guides.forEach((g) => out.push({ url: `${SITE_URL}/guide/${g.slug}`, lastModified: new Date(g.updated), changeFrequency: "monthly", priority: 0.8 }));
  } catch (err) {
    console.error("[sitemap] Sanity index failed:", err);
  }
  return out;
}
