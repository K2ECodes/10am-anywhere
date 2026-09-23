import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductSort from "@/components/ProductSort";
import EditorialCards from "@/components/EditorialCards";
import PhotoGrid from "@/components/PhotoGrid";
import NewsletterGate from "@/components/NewsletterGate";
import { isSubscribed } from "@/lib/newsletter-gate";
import {
  getCategoryBySlug,
  getProductsByCategory,
  getEditorialsByCategory,
  getCategoryGallery,
} from "@/lib/content";

// Sections reserved for newsletter subscribers.
const GATED = new Set(["travel", "culture"]);
// Sections that use the beige "shop" background with white product cards.
const SHOP_BG = new Set(["fashion", "culture", "interior"]);
// Sections that use the editorial (occasional larger tiles) product layout.
const EDITORIAL = new Set(["fashion", "interior", "beauty"]);

// Render on every request so a product published into this category in Sanity
// shows up immediately, rather than waiting for the next deploy/build. No
// generateStaticParams: with it, Next prerenders these at build time (SSG) and
// the page goes stale; rendering on demand keeps the grid live.
export const dynamic = "force-dynamic";

// Editorial sections get a script headline + a short standfirst under the label.
const CATEGORY_INTRO: Record<string, { headline: string; text: string }> = {
  travel: {
    headline: "Where We're Headed",
    text: "Hotels we'd book again, restaurants worth the reservation and the neighbourhoods we can't stop recommending, our picks for where to go and where to stay.",
  },
  culture: {
    headline: "What We're Into",
    text: "Our running list of the best podcasts, books, art, and live shows on our radar. Curated, not exhaustive, just what's genuinely worth your time.",
  },
};

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const cat = getCategoryBySlug(params.slug);
  return { title: cat ? `${cat.name} · 10am` : "10am" };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = getCategoryBySlug(params.slug);
  if (!category) notFound();

  // Members-only sections: show the newsletter gate until the reader subscribes.
  if (GATED.has(params.slug) && !isSubscribed()) {
    return <NewsletterGate section={category.name} />;
  }

  const products = await getProductsByCategory(params.slug);
  const editorials = await getEditorialsByCategory(params.slug);
  const gallery = getCategoryGallery(params.slug);

  const intro = CATEGORY_INTRO[params.slug];

  return (
    <div className={SHOP_BG.has(params.slug) ? "shop-page" : undefined}>
      <div className="cat-orient">{category.name}</div>

      {intro ? (
        <header className="cat-intro">
          <h1 className="cat-headline">{intro.headline}</h1>
          <p className="cat-intro-text">{intro.text}</p>
        </header>
      ) : null}

      {products.length > 0 ? (
        <ProductSort products={products} editorial={EDITORIAL.has(params.slug)} />
      ) : null}

      <EditorialCards
        items={editorials}
        label={params.slug === "culture" ? "What's on now" : "Editorials"}
        highlight={params.slug === "culture"}
      />

      {gallery.length > 0 ? <PhotoGrid photos={gallery} label={`${category.name}, in pictures`} /> : null}
    </div>
  );
}
