#!/usr/bin/env node
/*
 * Awin Product-Feed importer → Sanity drafts (project 3fb6egil).
 *
 * Pulls products from an Awin "Create-a-Feed" URL (Toolbox › Create-a-Feed),
 * maps the standard Awin columns to the 10am Product schema, and upserts each as
 * a DRAFT (drafts.awin-<aw_product_id>), deduped by aw_product_id. Images are
 * downloaded from the feed and uploaded as Sanity assets. affiliateUrl is set to
 * the feed's aw_deep_link (already an Awin tracked link → /go/[slug] monetises).
 *
 * DRY RUN BY DEFAULT — prints what it would write. Pass --commit to actually
 * write. Streaming CSV parser stops at --limit without loading the whole feed.
 *
 * Usage:
 *   set -a && . ./.env.local && set +a
 *   node scripts/import-awin-feed.cjs --url="<create-a-feed url>" --limit=20 [--category=fashion] [--department=women] [--commit]
 *   # or put the feed URL in AWIN_FEED_URL and omit --url
 *
 * Feed URL: use the Awin Create-a-Feed CSV export. Recommended columns:
 *   aw_product_id, product_name, brand_name, merchant_name, search_price,
 *   currency, aw_image_url (or merchant_image_url), aw_deep_link,
 *   merchant_category. Gzip compression is auto-detected.
 */
const https = require("https");
const zlib = require("zlib");
const { createClient } = require("@sanity/client");

// ---- args ---------------------------------------------------------------
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    return m ? [m[1], m[2] ?? true] : [a, true];
  })
);
const FEED_URL = args.url || process.env.AWIN_FEED_URL;
const LIMIT = args.limit ? parseInt(args.limit, 10) : 25;
const COMMIT = Boolean(args.commit);
const DELIM = args.delim || ",";
const FORCE_CATEGORY = args.category || null; // fashion|interior|beauty|men|travel|culture
const DEPARTMENT = args.department || "women"; // women|men|unisex

if (!FEED_URL) {
  console.error("Missing feed URL. Pass --url=… or set AWIN_FEED_URL. (Get it from Awin › Toolbox › Create-a-Feed, CSV format.)");
  process.exit(1);
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2026-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  perspective: "raw",
});

// ---- helpers ------------------------------------------------------------
function slugify(s) {
  return String(s).toLowerCase().normalize("NFD").replace(/[^\x00-\x7F]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 90);
}
function toNumber(s) {
  if (s == null) return undefined;
  const n = parseFloat(String(s).replace(/[^0-9.,]/g, "").replace(/,(\d{2})$/, ".$1").replace(/,/g, ""));
  return isNaN(n) ? undefined : Math.round(n);
}
// map an Awin category string to one of the 6 site categories
function mapCategory(raw) {
  if (FORCE_CATEGORY) return FORCE_CATEGORY;
  const s = (raw || "").toLowerCase();
  if (/beauty|fragrance|skincare|cosmetic|makeup/.test(s)) return "beauty";
  if (/home|interior|furniture|kitchen|decor|tableware|glass/.test(s)) return "interior";
  if (/travel|hotel|holiday|flight/.test(s)) return "travel";
  if (/\bmen\b|menswear|herren/.test(s)) return "men";
  return "fashion"; // default
}
const pick = (row, headers, names) => {
  for (const n of names) {
    const i = headers.indexOf(n);
    if (i >= 0 && row[i] != null && row[i] !== "") return row[i];
  }
  return undefined;
};

// streaming CSV tokenizer: feed chunks, get row arrays; handles quotes/escapes
function makeCsv(onRow) {
  let field = "", row = [], inQ = false;
  return {
    push(text) {
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (inQ) {
          if (ch === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
          else field += ch;
        } else if (ch === '"') inQ = true;
        else if (ch === DELIM) { row.push(field); field = ""; }
        else if (ch === "\n") { row.push(field); onRow(row); row = []; field = ""; }
        else if (ch !== "\r") field += ch;
      }
    },
    end() { if (field.length || row.length) { row.push(field); onRow(row); } },
  };
}

function streamFeed(url, onRecord, done) {
  https.get(url, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      res.resume(); return streamFeed(res.headers.location, onRecord, done);
    }
    if (res.statusCode !== 200) { res.resume(); return done(new Error("HTTP " + res.statusCode)); }
    const gz = /gzip/.test(res.headers["content-encoding"] || "") ||
      /application\/gzip/.test(res.headers["content-type"] || "") ||
      /\.gz(\?|$)/.test(url) || /gzip/.test(url);
    const stream = gz ? res.pipe(zlib.createGunzip()) : res;
    let headers = null, count = 0, stopped = false, done_ = false;
    const finish = (err) => { if (done_) return; done_ = true; done(err, count); };
    const csv = makeCsv((row) => {
      if (stopped) return;
      if (!headers) { headers = row.map((h) => h.trim()); return; }
      onRecord(headers, row, ++count);
      if (count >= LIMIT) { stopped = true; res.destroy(); finish(null); } // resolve on limit
    });
    stream.on("data", (c) => !stopped && csv.push(c.toString("utf8")));
    stream.on("end", () => { if (!stopped) csv.end(); finish(null); });
    stream.on("error", (e) => { if (!stopped) finish(e); }); // ignore destroy-triggered errors
  }).on("error", done);
}

async function uploadImage(url) {
  const buf = await new Promise((resolve, reject) => {
    https.get(url, { headers: { "user-agent": "Mozilla/5.0" } }, (r) => {
      if (r.statusCode !== 200) { r.resume(); return reject(new Error("img HTTP " + r.statusCode)); }
      const chunks = []; r.on("data", (c) => chunks.push(c)); r.on("end", () => resolve(Buffer.concat(chunks)));
    }).on("error", reject);
  });
  const asset = await client.assets.upload("image", buf, { filename: slugify(url).slice(-40) + ".jpg" });
  return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
}

// ---- run ----------------------------------------------------------------
(async () => {
  const records = [];
  await new Promise((resolve, reject) =>
    streamFeed(FEED_URL, (headers, row) => {
      const awId = pick(row, headers, ["aw_product_id", "product_id", "merchant_product_id"]);
      const name = pick(row, headers, ["product_name", "product_name_de", "product_short_description"]);
      const link = pick(row, headers, ["aw_deep_link", "deep_link", "aw_deep_link_1"]);
      if (!awId || !name || !link) return;
      records.push({
        awId,
        name,
        link,
        brand: pick(row, headers, ["brand_name", "brand", "merchant_name"]),
        price: toNumber(pick(row, headers, ["search_price", "store_price", "price", "display_price"])),
        currency: pick(row, headers, ["currency"]) || "EUR",
        image: pick(row, headers, ["aw_image_url", "merchant_image_url", "image_url", "large_image"]),
        category: mapCategory(pick(row, headers, ["merchant_category", "category_name", "custom_1", "merchant_product_category_path"])),
      });
    }, (err) => (err ? reject(err) : resolve()))
  );

  // Awin feeds are one row per SKU (size). Collapse size variants into one
  // product, keyed by brand + name-with-trailing-size-stripped (colourways stay
  // separate). --limit counts raw rows, so raise it to surface more products.
  const seen = new Set();
  const items = [];
  for (const r of records) {
    const base = String(r.name).toLowerCase().replace(/\s*[-–,]\s*(gr(?:ö|oe)ße|größe|size|taille|talla|gr\.)\s+\S+\s*$/i, "").trim();
    const key = (r.brand || "") + "|" + base;
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(r);
  }

  console.log(`\nParsed ${records.length} feed rows → ${items.length} unique product(s) (limit ${LIMIT} rows). Mode: ${COMMIT ? "COMMIT" : "DRY RUN"}\n`);
  for (const r of items) {
    const id = "drafts.awin-" + slugify(r.awId);
    console.log(`  ${r.brand || "?"} — ${r.name}  ${r.price != null ? r.currency + " " + r.price : "(no price)"}  [${r.category}]  img:${r.image ? "Y" : "—"}`);
    if (!COMMIT) continue;
    const base = {
      _id: id, _type: "product", department: DEPARTMENT, active: true,
      slug: { _type: "slug", current: slugify(`${r.brand || ""}-${r.name}`) + "-" + slugify(r.awId).slice(-6) },
      category: { _type: "reference", _ref: "category-" + r.category },
      awProductId: r.awId,
    };
    await client.createIfNotExists(base);
    const existing = await client.getDocument(id);
    const set = { productName: r.name, affiliateUrl: r.link, sourceUrl: r.link, network: "awin" };
    if (r.brand) set.brand = r.brand;
    if (r.price != null) set.price = r.price;
    if (r.currency) set.currency = r.currency;
    if (r.image && !(existing && existing.primaryImage)) {
      try { set.primaryImage = await uploadImage(r.image); } catch (e) { console.log("    image failed:", e.message); }
    }
    await client.patch(id).set(set).commit({ visibility: "async" });
  }
  console.log(`\n${COMMIT ? "Committed" : "Dry run complete"}. ${COMMIT ? "Upserted " + records.length + " drafts." : "Re-run with --commit to write."}`);
})().catch((e) => { console.error("ERR:", e.message); process.exit(1); });
