/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@sanity/client";
import { awinLinkFor } from "@/lib/affiliate/awin";

// Auto-populates a Sanity product from its pasted `sourceUrl`. Triggered by a
// Sanity webhook on product create/update (POST), or manually for testing
// (GET ?id=<docId>&secret=…). Scrapes JSON-LD `Product` + Open Graph meta for
// brand / name / price / currency — no AI key needed. Pepa supplies the cropped
// image; this fills the rest and sets affiliateUrl = the product link.

export const runtime = "nodejs";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2026-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

function authed(req: Request): boolean {
  const secret =
    new URL(req.url).searchParams.get("secret") || req.headers.get("x-enrich-secret");
  return Boolean(process.env.ENRICH_SECRET) && secret === process.env.ENRICH_SECRET;
}

function toNumber(s: unknown): number | undefined {
  if (s == null) return undefined;
  const cleaned = String(s).replace(/[^0-9.,]/g, "").replace(/,(\d{2})$/, ".$1").replace(/,/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? undefined : Math.round(n);
}

function slugify(s: string): string {
  return String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 90);
}

function metaContent(html: string, prop: string): string | undefined {
  const a = html.match(
    new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`, "i")
  );
  if (a) return a[1];
  const b = html.match(
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`, "i")
  );
  return b ? b[1] : undefined;
}

interface Extracted {
  brand?: string;
  name?: string;
  price?: number;
  currency?: string;
}

// Browser-like headers clear mild bot checks. Bot-hostile luxury retailers
// (Mytheresa, Farfetch, Balenciaga, YOOX…) block datacenter IPs outright — for
// those, set SCRAPINGBEE_API_KEY and requests retry through a residential proxy.
const BROWSER_HEADERS = {
  "user-agent": UA,
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "accept-language": "de-DE,de;q=0.9,en;q=0.8",
  "sec-ch-ua": '"Chromium";v="126", "Not.A/Brand";v="24"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"macOS"',
  "upgrade-insecure-requests": "1",
};

function looksBlocked(html: string): boolean {
  if (!html || html.length < 500) return true;
  return /just a moment\.\.\.|captcha|access denied|are you a (?:human|robot)|enable javascript to continue|<title>\s*403/i.test(html);
}

async function fetchHtml(url: string): Promise<string | null> {
  // 1) direct request with browser headers
  try {
    const res = await fetch(url, { headers: BROWSER_HEADERS, redirect: "follow" });
    if (res.ok) {
      const html = await res.text();
      if (!looksBlocked(html)) return html;
    }
  } catch {
    /* fall through to proxy */
  }
  // 2) residential-proxy fallback (opt-in) for bot-hostile retailers
  const key = process.env.SCRAPINGBEE_API_KEY;
  if (key) {
    try {
      const proxied =
        "https://app.scrapingbee.com/api/v1/?api_key=" + key +
        "&url=" + encodeURIComponent(url) +
        "&render_js=false&premium_proxy=true&country_code=de";
      const res = await fetch(proxied);
      if (res.ok) return await res.text();
    } catch {
      /* give up, caller sets the fallback name */
    }
  }
  return null;
}

async function extract(url: string): Promise<Extracted> {
  const html = await fetchHtml(url);
  const out: Extracted = {};
  if (!html) return out;

  const ldBlocks = Array.from(
    html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
  );
  for (const m of ldBlocks) {
    try {
      const parsed = JSON.parse(m[1].trim());
      const nodes: any[] = Array.isArray(parsed) ? parsed : parsed["@graph"] || [parsed];
      for (const node of nodes) {
        const t = node?.["@type"];
        const isProduct = t === "Product" || (Array.isArray(t) && t.includes("Product"));
        if (!isProduct) continue;
        out.name ??= typeof node.name === "string" ? node.name.trim() : undefined;
        if (node.brand) out.brand ??= typeof node.brand === "string" ? node.brand : node.brand.name;
        const offers = Array.isArray(node.offers) ? node.offers[0] : node.offers;
        if (offers) {
          out.price ??= toNumber(offers.price ?? offers.lowPrice ?? offers.highPrice);
          out.currency ??= offers.priceCurrency;
        }
      }
    } catch {
      /* ignore malformed json-ld */
    }
  }

  // Open Graph / product meta fallback
  out.name ??= metaContent(html, "og:title");
  out.brand ??= metaContent(html, "product:brand") || metaContent(html, "og:brand");
  out.price ??= toNumber(metaContent(html, "product:price:amount") || metaContent(html, "og:price:amount"));
  out.currency ??= metaContent(html, "product:price:currency") || metaContent(html, "og:price:amount:currency");
  return out;
}

async function resolve(req: Request) {
  const url = new URL(req.url);
  const idParam = url.searchParams.get("id");
  if (req.method === "GET" && idParam) {
    const doc = await client.getDocument(idParam);
    return doc
      ? { id: idParam, sourceUrl: (doc as any).sourceUrl, name: (doc as any).productName, force: true }
      : null;
  }
  try {
    const body = await req.json();
    return { id: body._id as string, sourceUrl: body.sourceUrl as string, name: body.productName as string, force: false };
  } catch {
    return null;
  }
}

async function handle(req: Request) {
  if (!authed(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!process.env.SANITY_API_WRITE_TOKEN)
    return NextResponse.json({ error: "missing write token" }, { status: 500 });

  const info = await resolve(req);
  if (!info?.id || !info.sourceUrl) return NextResponse.json({ skipped: "no id or sourceUrl" });
  // Loop guard: on webhook updates only enrich when the name is still empty.
  if (!info.force && info.name) return NextResponse.json({ skipped: "already named" });

  let data: Extracted;
  try {
    data = await extract(info.sourceUrl);
  } catch (e) {
    return NextResponse.json({ error: "fetch failed (retailer may block bots)", detail: String(e) }, { status: 502 });
  }

  // Monetise the outbound link: if the destination is a joined Awin advertiser,
  // store the Awin tracked deep link and tag the network; otherwise keep the raw
  // product URL (unchanged behaviour when Awin isn't configured).
  const awin = awinLinkFor(info.sourceUrl);
  const patch: Record<string, unknown> = {
    affiliateUrl: awin ?? info.sourceUrl,
    network: awin ? "awin" : "direct",
  };
  if (data.brand) patch.brand = data.brand;
  if (typeof data.price === "number") patch.price = data.price;
  if (data.currency) patch.currency = data.currency;
  // Always set productName so the webhook filter (!defined(productName)) stops
  // matching — otherwise a bot-blocked retailer (no name) would loop forever.
  let host = "";
  try {
    host = new URL(info.sourceUrl).hostname.replace(/^www\./, "");
  } catch {
    /* ignore */
  }
  patch.productName = data.name || `Add product name (${host})`;

  // Generate a slug if the product doesn't have one yet. Without this, products
  // added via the paste-flow (the Studio only makes a slug on manual "Generate")
  // ship with no slug, so their cards link to /go/null. setIfMissing preserves
  // any slug an editor already set.
  const slugCurrent =
    (slugify(`${data.brand ?? ""} ${data.name ?? host}`) || "item") +
    "-" +
    info.id.replace(/^drafts\./, "").slice(0, 6);

  await client
    .patch(info.id)
    .setIfMissing({ slug: { _type: "slug", current: slugCurrent } })
    .set(patch)
    .commit();
  return NextResponse.json({ ok: true, id: info.id, patched: { ...patch, slug: slugCurrent } });
}

export const GET = handle;
export const POST = handle;
