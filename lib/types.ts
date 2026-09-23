// Content shapes. These mirror the Sanity schema (sanity/schemas) so the seed
// layer and the live Sanity layer are interchangeable behind lib/content.ts.

export type AffiliateNetwork =
  | "awin"
  | "cj"
  | "rakuten"
  | "rewardstyle"
  | "skimlinks"
  | "direct";

export type Department = "women" | "men" | "unisex";

export type GridSize = "1x1" | "2x1" | "1x2" | "2x2";

export interface Product {
  slug: string;
  brand: string;
  name: string;
  price: number;
  currency: string; // ISO, default EUR
  /** Path under /public/images or a Sanity CDN url. Optional: men's imagery is still to come. */
  image?: string;
  department: Department;
  category?: string;
  affiliateUrl: string;
  /** The raw product link (fallback destination when there's no affiliateUrl). */
  sourceUrl?: string;
  network: AffiliateNetwork;
  gridSize: GridSize;
  /** Extra web-only piece (not in the Instagram look) — shows a subtle tag. */
  webExclusive?: boolean;
  active: boolean;
}

export interface CollageTile {
  image: string;
  alt: string;
  caption: string;
  num: string;
}

export interface EditSection {
  title: string;
  products: Product[];
}

export interface Edit {
  title: string; // may contain a <br> split as two lines
  titleLines: [string, string];
  eyebrow: string;
  issue: string;
  description: string;
  collage: CollageTile[];
  products: Product[];
  /** Optional grouped layout (e.g. Back to School by school level). When present,
   * the homepage carousel renders these sections instead of the flat product grid. */
  sections?: EditSection[];
  /** Optional phone-only cover image (square/portrait) so a wide desktop collage
   * doesn't shrink on mobile. Falls back to collage[0] when absent. */
  mobileCover?: string;
}

export interface MenEdit {
  kicker: string;
  titleLines: [string, string];
  dek: string;
  products: Product[];
}

export interface EditorialFeature {
  tag: string;
  kicker: string;
  titleHtml: string; // small inline emphasis, trusted internal copy
  dek: string;
  meta: string[];
  body: string[];
  cta: string;
  slug: string; // article the "Read the edit" CTA links to
  image: string;
}

export interface ClockCity {
  city: string;
  tz: string;
  abbr: string;
}

export interface Category {
  name: string;
  slug: string;
  description: string;
}

export interface Founder {
  name: string;
  role: string;
  bio: string;
}

export interface ArticleSectionLink {
  label: string;
  url: string;
}

export interface ArticleSection {
  kicker: string;
  heading: string;
  image: string;
  body: string[];
  links: ArticleSectionLink[];
}

export interface Article {
  slug: string;
  title: string;
  titleHtml: string;
  category: string;
  dek: string;
  heroImage: string;
  author: string;
  date: string;
  readingTime: string;
  body: string[];
  sections: ArticleSection[];
  shopThisStory: Product[];
}

export interface GuidePlace {
  name: string;
  blurb: string;
  affiliateUrl?: string;
}

export interface CityGuide {
  slug: string;
  city: string;
  country: string;
  category: string;
  heroImage: string;
  intro: string[];
  gated: boolean;
  stay: GuidePlace[];
  eat: GuidePlace[];
  do: GuidePlace[];
  shop: GuidePlace[];
  gallery: string[];
}

// A link to an editorial (article or city guide), shown in its category section.
export interface EditorialRef {
  kind: "article" | "guide";
  slug: string;
  title: string;
  image: string;
  category: string;
  kicker: string;
}
