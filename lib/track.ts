import type { Product } from "@/lib/types";

// Client-side analytics. Every call no-ops unless the relevant tag has loaded,
// which only happens after the visitor accepts consent — so all of this is
// consent-gated by construction (no consent => no window.fbq/gtag => nothing
// fires). Each action is sent to BOTH the Meta Pixel and Google Analytics 4.
function fbq(...args: unknown[]) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq(...args);
  }
}
function gtagEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", name, params ?? {});
  }
}

// Meta Pixel content params.
function productParams(p: Product): Record<string, unknown> {
  const params: Record<string, unknown> = {
    content_ids: [p.slug],
    content_name: `${p.brand} ${p.name}`.trim(),
    content_type: "product",
    currency: p.currency || "EUR",
  };
  if (p.category) params.content_category = p.category;
  if (typeof p.price === "number" && p.price > 0) params.value = p.price;
  return params;
}

// GA4 ecommerce-style params (items array + value + currency).
function gaItemParams(p: Product): Record<string, unknown> {
  const item: Record<string, unknown> = {
    item_id: p.slug,
    item_name: `${p.brand} ${p.name}`.trim(),
    item_brand: p.brand,
  };
  if (p.category) item.item_category = p.category;
  if (typeof p.price === "number") item.price = p.price;
  const params: Record<string, unknown> = { currency: p.currency || "EUR", items: [item] };
  if (typeof p.price === "number" && p.price > 0) params.value = p.price;
  return params;
}

// Conversion on newsletter signup.
export function trackLead() {
  fbq("track", "Lead");
  gtagEvent("newsletter_signup");
}

// The key affiliate signal: a click through to the retailer (via /go/[slug]).
export function trackAffiliateClick(p: Product) {
  fbq("trackCustom", "AffiliateClick", productParams(p));
  gtagEvent("affiliate_click", gaItemParams(p));
}

// A product came into view (fired on meaningful impression, see ProductCard).
export function trackViewContent(p: Product) {
  fbq("track", "ViewContent", productParams(p));
  gtagEvent("view_item", gaItemParams(p));
}

// A product was saved to the wishlist.
export function trackAddToWishlist(p: Product) {
  fbq("track", "AddToWishlist", productParams(p));
  gtagEvent("add_to_wishlist", gaItemParams(p));
}

// A site search was run.
export function trackSearch(query: string) {
  fbq("track", "Search", { search_string: query });
  gtagEvent("search", { search_term: query });
}
