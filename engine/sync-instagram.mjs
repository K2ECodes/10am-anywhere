// Pulls the newest post from @10am_anywhere into Sanity (doc "engineSource.instagram")
// so the Content Engine always starts from what 10am last published.
//
//   node engine/sync-instagram.mjs [--handle 10am_anywhere]
//
// Reads the public profile with a headless browser (no Instagram login), takes
// the newest of the first few grid posts by publish date (skips a pinned post),
// stores its caption, date, link and cover image, and matches it to the website
// edit it promotes. Once 10am connects the Instagram Graph API (IG_ACCESS_TOKEN +
// IG_USER_ID on Vercel) the engine reads the feed directly and this becomes the
// fallback.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };
const HANDLE = arg("--handle", "10am_anywhere");
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnv(path.join(process.cwd(), ".env.local"));

function loadPlaywright() {
  const tries = [process.env.PLAYWRIGHT_PATH, "playwright", path.join(process.env.HOME, ".local/opt/node/lib/node_modules/playwright")];
  for (const t of tries.filter(Boolean)) { try { return require(t); } catch {} }
  throw new Error("Playwright not found. Set PLAYWRIGHT_PATH or npm i -g playwright.");
}

const PID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DS = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const TOKEN = process.env.SANITY_API_WRITE_TOKEN;
const API = `https://${PID}.api.sanity.io/v2023-10-01`;
const H = { Authorization: `Bearer ${TOKEN}` };
const groq = async (q) => (await (await fetch(`${API}/data/query/${DS}?query=${encodeURIComponent(q)}`, { headers: H })).json()).result;

const { chromium } = loadPlaywright();
const browser = await chromium.launch();
const page = await browser.newPage({ userAgent: UA, viewport: { width: 1280, height: 1600 } });

await page.goto(`https://www.instagram.com/${HANDLE}/`, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
const codes = [...new Set(await page.$$eval('a[href*="/p/"], a[href*="/reel/"]', (as) =>
  as.map((a) => (a.getAttribute("href").match(/\/(p|reel)\/([A-Za-z0-9_-]+)/) || [])[2]).filter(Boolean)))].slice(0, 3);
if (!codes.length) { console.error("No posts found on the profile page (Instagram may be rate limiting). Try again in a few minutes."); process.exit(1); }

const posts = [];
for (const code of codes) {
  await page.goto(`https://www.instagram.com/p/${code}/`, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
  const meta = await page.$$eval("meta", (ms) => Object.fromEntries(ms.map((m) => [m.getAttribute("property") || m.getAttribute("name"), m.getAttribute("content")]).filter(([k]) => k)));
  const html = await page.content();
  const takenAt = Number((html.match(/"taken_at":(\d{10})/) || [])[1] || 0);
  // og:title is `10am on Instagram: "<caption>"`.
  const caption = ((meta["og:title"] || "").match(/Instagram:\s*"([\s\S]*)"\s*$/) || [])[1] || "";
  posts.push({ code, takenAt, caption, image: meta["og:image"], url: `https://www.instagram.com/p/${code}/` });
}
await browser.close();

const latest = posts.sort((a, b) => b.takenAt - a.takenAt)[0];
if (!latest.caption) { console.error("Could not read the caption for", latest.url); process.exit(1); }

// Match the post to the website edit it promotes: the edit whose title appears in the caption.
const edits = await groq('*[_type=="edit" && defined(slug.current)]|order(_createdAt desc){title,"slug":slug.current}');
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ");
const cap = norm(latest.caption);
const edit = edits.find((e) => cap.includes(norm(e.title))) || null;
const keyword = (latest.caption.match(/comment\s+[‘'"“]?([A-Za-z]+)[’'"”]?/i) || [])[1] || null;

let imageField;
if (latest.image) {
  const img = await fetch(latest.image, { headers: { "User-Agent": UA } });
  const up = await fetch(`${API}/assets/images/${DS}?filename=ig-${latest.code}.jpg`, {
    method: "POST", headers: { ...H, "Content-Type": "image/jpeg" }, body: Buffer.from(await img.arrayBuffer()),
  });
  const j = await up.json();
  if (j.document) imageField = { _type: "image", asset: { _type: "reference", _ref: j.document._id } };
}

const doc = {
  _id: "engineSource.instagram",
  _type: "engineSource",
  handle: HANDLE,
  code: latest.code,
  url: latest.url,
  caption: latest.caption,
  postedAt: new Date(latest.takenAt * 1000).toISOString(),
  keyword: keyword ? keyword.toUpperCase() : null,
  editSlug: edit?.slug ?? null,
  editTitle: edit?.title ?? null,
  syncedAt: new Date().toISOString(),
  ...(imageField ? { image: imageField } : {}),
};
const r = await fetch(`${API}/data/mutate/${DS}`, {
  method: "POST", headers: { ...H, "Content-Type": "application/json" },
  body: JSON.stringify({ mutations: [{ createOrReplace: doc }] }),
});
if (!r.ok) { console.error("Sanity write failed", r.status, await r.text()); process.exit(1); }
console.log(`Synced ${latest.url} (${doc.postedAt.slice(0, 10)}) -> edit: ${doc.editSlug ?? "none"}, keyword: ${doc.keyword ?? "none"}`);
