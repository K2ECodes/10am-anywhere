// Turns a plain retailer product URL into an Awin tracked deep link so clicks
// through /go/[slug] actually earn commission. Deep-link format:
//   https://www.awin1.com/cread.php?awinmid={advertiserId}&awinaffid={publisherId}&ued={destUrl}
//
// The feature is OFF (awinLinkFor returns null) until AWIN_PUBLISHER_ID is set,
// so with no env configured the enrich route behaves exactly as before
// (affiliateUrl = the raw product link). Advertiser ids (awinmid) come from the
// ADVERTISERS map below — fill it from Awin › Toolbox › Joined Programmes. Once
// an AWIN_API_TOKEN is added we can auto-populate this map from the Publisher API
// instead of maintaining it by hand (see resolveAwinmidViaApi TODO).

const PUBLISHER_ID = process.env.AWIN_PUBLISHER_ID;

// domain (without leading www) -> Awin advertiser id (awinmid).
// Seed with 10am's joined advertisers. Extend as they join more.
// The values below are PLACEHOLDERS — replace each with the real awinmid from
// the Awin dashboard (Toolbox › Link Builder shows the id for each advertiser).
// Joined Awin advertisers as of 2026-07-23 (from the publisher feed list).
// Add a line here each time 10am joins a new programme — the awinmid is the
// "Advertiser ID" shown in Awin › Toolbox. (Vilebrequin runs per-region
// programmes: DE 70915, FR 70913 — using DE for the .com domain.)
const ADVERTISERS: Record<string, string> = {
  "tusting.co.uk": "123482",
  "vilebrequin.com": "70915",
  "adidas.sk": "77024",
  // pending joins (fill awinmid when approved): sezane.com, smallable.com,
  // reformation.com, nordicnest.com, getyourguide.com, bookshop.org …
};

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

/**
 * Returns an Awin tracked deep link for `destUrl` if the destination's domain is
 * a joined Awin advertiser, otherwise null (caller should fall back to the raw
 * URL). Pure/synchronous — safe to call in the enrich route's hot path.
 */
export function awinLinkFor(destUrl: string): string | null {
  if (!PUBLISHER_ID) return null;
  const host = hostOf(destUrl);
  if (!host) return null;
  // match the exact host, then the registrable domain (sub.brand.com -> brand.com)
  const parent = host.split(".").slice(-2).join(".");
  const mid = ADVERTISERS[host] ?? ADVERTISERS[parent];
  if (!mid) return null;
  return `https://www.awin1.com/cread.php?awinmid=${mid}&awinaffid=${PUBLISHER_ID}&ued=${encodeURIComponent(
    destUrl
  )}`;
}

/** True when Awin deep-linking is configured (publisher id present). */
export const awinEnabled = Boolean(PUBLISHER_ID);
