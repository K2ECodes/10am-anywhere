import type {
  Edit,
  MenEdit,
  EditorialFeature,
  Product,
  ClockCity,
  Category,
  Founder,
  Article,
  CityGuide,
} from "./types";
import {
  seedEdit,
  seedMenEdit,
  seedEditorialFeature,
  clockCities,
  allSeedProducts,
  seedCategories,
  seedFounders,
  allSeedArticles,
  seedCityGuide,
  productsByCategory,
  editorialsByCategory,
  galleryByCategory,
} from "./seed";
import type { EditorialRef } from "./types";
import { sanityEnabled } from "./sanity/client";

// Single content boundary for the app. When a Sanity project id is set
// (NEXT_PUBLIC_SANITY_PROJECT_ID) the homepage reads from Sanity; otherwise, and
// whenever Sanity is empty or unreachable, it falls back to the seed so the site
// is never blank during the content transition.

export async function getCurrentEdit(): Promise<Edit> {
  if (sanityEnabled) {
    try {
      const { fetchCurrentEdit } = await import("./sanity/queries");
      const edit = await fetchCurrentEdit();
      if (edit && edit.products.length > 0) return edit;
    } catch (err) {
      console.error("[content] getCurrentEdit Sanity fetch failed, using seed:", err);
    }
  }
  return seedEdit;
}

// A specific edit by its title-slug for its own /edit/[slug] page. Sanity-only
// (returns null -> 404 when the slug matches no published edit).
export async function getEditBySlug(slug: string): Promise<Edit | null> {
  if (sanityEnabled) {
    try {
      const { fetchEditBySlug } = await import("./sanity/queries");
      return await fetchEditBySlug(slug);
    } catch (err) {
      console.error("[content] getEditBySlug Sanity fetch failed:", err);
    }
  }
  return null;
}

// The latest N edits for the homepage carousel. Falls back to the single seed
// edit so the homepage is never blank during the content transition.
export async function getLatestEdits(limit = 2): Promise<Edit[]> {
  if (sanityEnabled) {
    try {
      const { fetchLatestEdits } = await import("./sanity/queries");
      const edits = await fetchLatestEdits(limit);
      if (edits.length > 0) return edits;
    } catch (err) {
      console.error("[content] getLatestEdits Sanity fetch failed, using seed:", err);
    }
  }
  return [seedEdit];
}

export async function getMenEdit(): Promise<MenEdit> {
  if (sanityEnabled) {
    try {
      const { fetchMenEdit } = await import("./sanity/queries");
      const men = await fetchMenEdit();
      if (men && men.products.length > 0) return men;
    } catch (err) {
      console.error("[content] getMenEdit Sanity fetch failed, using seed:", err);
    }
  }
  return seedMenEdit;
}

export async function getEditorialFeature(): Promise<EditorialFeature> {
  return seedEditorialFeature;
}

export function getClockCities(): ClockCity[] {
  return clockCities;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (sanityEnabled) {
    try {
      const { fetchProductBySlug } = await import("./sanity/queries");
      const p = await fetchProductBySlug(slug);
      if (p) return p;
    } catch (err) {
      console.error("[content] getProductBySlug Sanity fetch failed, using seed:", err);
    }
  }
  return allSeedProducts.find((p) => p.slug === slug) ?? null;
}

export function getAllProducts(): Product[] {
  return allSeedProducts;
}

// Search index: the full live catalog from Sanity (falls back to seed when Sanity
// is empty/unreachable). Async because the previous sync getAllProducts only ever
// returned the 16 seed items, so search missed everything added in the Studio.
export async function getSearchProducts(): Promise<Product[]> {
  if (sanityEnabled) {
    try {
      const { fetchAllProducts } = await import("./sanity/queries");
      const rows = await fetchAllProducts();
      if (rows.length > 0) return rows;
    } catch (err) {
      console.error("[content] getSearchProducts Sanity fetch failed, using seed:", err);
    }
  }
  return allSeedProducts;
}

export function getCategories(): Category[] {
  return seedCategories;
}

export function getCategoryBySlug(slug: string): Category | null {
  return seedCategories.find((c) => c.slug === slug) ?? null;
}

export async function getProductsByCategory(slug: string): Promise<Product[]> {
  if (sanityEnabled) {
    try {
      const { fetchProductsByCategory } = await import("./sanity/queries");
      const rows = await fetchProductsByCategory(slug);
      if (rows.length > 0) return rows;
    } catch (err) {
      console.error("[content] getProductsByCategory Sanity fetch failed, using seed:", err);
    }
  }
  return productsByCategory(slug);
}

export async function getEditNavLinks(limit = 6): Promise<{ title: string; slug: string }[]> {
  if (sanityEnabled) {
    try {
      const { fetchEditNavLinks } = await import("./sanity/queries");
      return await fetchEditNavLinks(limit);
    } catch (err) {
      console.error("[content] getEditNavLinks failed:", err);
    }
  }
  return [];
}

export async function getEditorialsByCategory(slug: string): Promise<EditorialRef[]> {
  if (sanityEnabled) {
    try {
      const { fetchEditorialsByCategory } = await import("./sanity/queries");
      const rows = await fetchEditorialsByCategory(slug);
      if (rows.length > 0) return rows;
    } catch (err) {
      console.error("[content] getEditorialsByCategory Sanity fetch failed, using seed:", err);
    }
  }
  return editorialsByCategory(slug);
}

export function getCategoryGallery(slug: string): string[] {
  return galleryByCategory(slug);
}

export async function getFounders(): Promise<Founder[]> {
  if (sanityEnabled) {
    try {
      const { fetchFounders } = await import("./sanity/queries");
      const f = await fetchFounders();
      if (f.length > 0) return f;
    } catch (err) {
      console.error("[content] getFounders Sanity fetch failed, using seed:", err);
    }
  }
  return seedFounders;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (sanityEnabled) {
    try {
      const { fetchArticleBySlug } = await import("./sanity/queries");
      // Sanity is the source of truth: return its result even when null, so an
      // article removed from the Studio (e.g. the retired "Iconic vintage finds")
      // 404s instead of being resurrected from the seed.
      return await fetchArticleBySlug(slug);
    } catch (err) {
      console.error("[content] getArticleBySlug Sanity fetch failed, using seed:", err);
    }
  }
  return allSeedArticles.find((a) => a.slug === slug) ?? null;
}

export async function getCityGuideBySlug(slug: string): Promise<CityGuide | null> {
  if (sanityEnabled) {
    try {
      const { fetchCityGuideBySlug } = await import("./sanity/queries");
      // Sanity is the source of truth: return its result even when null, so a
      // guide removed from the Studio (e.g. Lisbon, replaced by Milano) 404s
      // instead of being resurrected from the seed.
      return await fetchCityGuideBySlug(slug);
    } catch (err) {
      console.error("[content] getCityGuideBySlug Sanity fetch failed, using seed:", err);
    }
  }
  return slug === seedCityGuide.slug ? seedCityGuide : null;
}
