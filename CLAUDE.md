# 10am anywhere — project guide

Production site for **10am anywhere UG** (Berlin): a luxury affiliate/editorial
magazine. Built and maintained by **Content Systems.ai** (Korede, Sanjana).

- **Live:** https://10amanywhere.com (Vercel, team `10am`, project `10am-anywhere`)
- **CMS:** Sanity Studio → https://tenam-anywhere.sanity.studio (project `3fb6egil`, dataset `production`)
- **Client contacts:** Silke Rumpelhardt (owner/editor, `info@10amanywhere.com`),
  Pepa (designer, logs in via Silke's account), Dorte + Corinna (stakeholders).

The business model is **affiliate**: products are sold by third-party retailers
(Breuninger via Awin, etc.). There is **no on-site checkout**. The money event is
an **outbound click** to a retailer.

---

## Commands

```bash
npm run dev                      # local dev
npm run build                    # ALWAYS run before deploying (catches TS/ESLint)
npx vercel --prod --yes          # deploy to production (aliases 10amanywhere.com)
```

**Loading env for one-off scripts** (the pattern used throughout):

```bash
cd ~/10am-anywhere && set -a && . ./.env.local && set +a && \
  NODE_PATH=$(pwd)/node_modules node -e '...'
```

**Sanity Studio deploy** (only when `sanity/schemas/index.ts` changes):

```bash
cd studio && SANITY_STUDIO_PROJECT_ID=3fb6egil SANITY_STUDIO_DATASET=production \
  SANITY_STUDIO_HOST=tenam-anywhere npx sanity deploy --yes
```

### Environment variables / secrets

`.env.local` holds 14 vars (names listed in `.env.local.example`).

⚠️ **`vercel env pull` does NOT restore them for this project.** Every variable in
Vercel is stored as **Sensitive**, which Vercel makes permanently unreadable after
creation — a pull writes the literal string `[SENSITIVE]` as each value, and the
build then fails. The only ways to set up a new machine are to **copy `.env.local`
directly** (AirDrop / password manager) or re-issue each key from its service (and a
fresh Sanity write token would then also need updating in Vercel). Treat the existing
`.env.local` as the single readable copy and don't lose it.

Without real values the site still builds but degrades: products/edits/guides load
from Sanity, **editorial articles silently fall back to seed data** (reading them
needs the token — see the read-token note below), and Supabase/wishlist/newsletter/
Resend/Flodesk/Awin are all inert.

---

## Architecture

Next.js 14 App Router + TypeScript. Sanity (content) + Supabase (auth, wishlist,
click logging, newsletter records) + Vercel (hosting).

- **Every data-driven page sets `export const dynamic = "force-dynamic"`.** Editors
  publish in Sanity and expect it live within seconds. Do NOT add
  `generateStaticParams` to content routes — it freezes them at build time.
- `lib/content.ts` is the read layer: it tries Sanity, falls back to seed data in
  `lib/seed.ts` when Sanity is unavailable/empty. Exception: `getArticleBySlug`
  returns Sanity's result **even when null**, so a deleted article 404s instead of
  resurrecting from seed.
- `lib/sanity/queries.ts` holds all GROQ + the mappers (`mapProduct`, etc.).

### Data flow gotchas (hard-won — read these)

1. **The Sanity client needs a server-side read token.** This dataset's *public*
   (tokenless) role can read `product`/`edit`/`editor`/`cityGuide` but **NOT
   `article`**. Without a token, culture/editorial articles are invisible and the
   site silently falls back to seed data. `lib/sanity/client.ts` therefore passes
   `SANITY_API_READ_TOKEN || SANITY_API_WRITE_TOKEN`. It is server-only (not
   `NEXT_PUBLIC_`), so it never reaches the browser.
2. **`perspective: "published"`** on the site client (dedupes drafts). Use
   `perspective: "raw"` in maintenance scripts when you need to see drafts.
3. **Product visibility filters use `active != false`, never `active == true`.**
   Publishing a product whose `active` field was never set serializes it as
   `false` and it vanishes. This caused a real client-facing bug.
4. **Server Actions auto-revalidate the route on completion.** That silently
   re-renders the page and can wipe a success message before it's seen. Where a
   confirmation must persist, POST to a **Route Handler** (`app/api/*/route.ts`)
   instead — Route Handlers do not auto-revalidate.
5. **`vercel --prod` intermittently returns `"status": "error"`.** It's transient;
   retrying once almost always succeeds.
6. **The shell's cwd resets after a backgrounded command.** Prefix
   `cd ~/10am-anywhere &&` on subsequent commands.
7. **Studio deploy needs an interactive `npx sanity login` session** (browser
   OAuth). The write token lacks the `sanity.project.deployStudio` grant, so
   `SANITY_AUTH_TOKEN` will NOT work — run it *without* that env var.

---

## Content model (Sanity)

Schemas live in `sanity/schemas/index.ts` and are imported by both the site
queries and `studio/sanity.config.ts` — one source of truth.

- **`product`** — brand, name, price, currency, image, category ref, department,
  `affiliateUrl`/`sourceUrl`, `network`, `gridSize` (1x1/2x1/1x2/2x2),
  `webExclusive` (subtle "web exclusive" tag), `active` (initialValue true).
- **`edit`** — a weekly/monthly look: `heroCollage`, `heroCoverMobile`
  ("Mobile cover (phone only)" — a phone-shaped cover so the wide desktop collage
  doesn't shrink), `featuredProducts`, optional grouped `sections[]`,
  `publishDate`, `status`.
- **`article`** — editorial. Flat `body[]` **plus** an optional `sections[]` array
  (kicker / heading / image / body / links) for the recurring column format used by
  the Culture notes. `gated` for members-only.
- **`category`**, **`editor`**, **`cityGuide`**.

Editors can override a product's tile size via `gridSize`; the grid otherwise
applies an automatic magazine rhythm (see below).

---

## Key UI behaviours

- **Editorial grid rhythm** (`components/EditGrid.tsx`): on fashion/interior/beauty/
  men, every 13th product renders as a large 2×2 feature tile
  (`FEATURE_OFFSETS = [8, 21]`, `CYCLE = 26`), leaving **two normal rows between
  feature bands**. `grid-auto-flow: row dense` closes the gaps. An editor's explicit
  `gridSize` always wins.
- **`ProductSort`** wraps the grid on category/men pages: Newest (the incoming
  order, already `_createdAt desc`), Price low→high, Price high→low.
- **`/go/[slug]`** is the affiliate redirect: it logs a first-party click to
  Supabase then 302s to the retailer. **Always link products through `/go`,** never
  the raw affiliate URL — it's how click analytics work.
- **Nav menu** columns are "What We Love" (categories) and "What We Shop" (edits).
  The edits list is **dynamic** — `app/layout.tsx` calls `getEditNavLinks(6)` so it
  never goes stale.
- **Top banner** ("Curated. Inspired. Yours" + white *Subscribe* box) lives in
  `components/Nav.tsx`; it opens the newsletter overlay. The footer's Subscribe box
  opens the same overlay via a `window` event (`open-subscribe`).

---

## Privacy & tracking (GDPR — this is a German company)

`components/ConsentBanner.tsx` stores the choice in `localStorage` as
`10am_consent` = `accepted` | `declined`, and dispatches a **`consent-changed`**
window event so tags can start immediately on accept.

**Nothing marketing/analytics may load before consent.** Both tags follow the same
pattern — load only when `10am_consent === "accepted"`, otherwise wait for the event:

- **Meta Pixel** (`components/MetaPixel.tsx`) — ID `1058299643735868`. Fires
  `PageView` on load *and on client-side route changes* (SPA — a raw paste would
  only count the landing page). The `<noscript>` fallback is deliberately omitted
  because it cannot be consent-gated.
- **GA4** (`components/GoogleAnalytics.tsx`) — ID `G-0KTQ86N362`. `gtag` config uses
  `send_page_view: false`; `page_view` is fired manually per route change.

**Events** (`lib/track.ts`) — each one fires to **both** Meta and GA4:

| Action | Meta | GA4 |
|---|---|---|
| Outbound click to retailer | `AffiliateClick` (custom) | `affiliate_click` |
| Product viewed (impression) | `ViewContent` | `view_item` |
| Wishlist save | `AddToWishlist` | `add_to_wishlist` |
| Site search | `Search` | `search` |
| Newsletter signup | `Lead` | `newsletter_signup` |

`AffiliateClick` is the revenue proxy — optimise ads toward it. ViewContent fires
on a *meaningful* impression (card ≥50% visible for 600ms) so fast scrolling
doesn't inflate it. All events carry value + currency + content/item ids.

> Consequence to remember: because everything is consent-gated, Pixel/GA numbers
> count **consented visitors only** and will always read lower than true traffic.
> That's correct, not a bug.

---

## Newsletter / Flodesk (read before touching)

Flodesk is the client's email platform. Segment **"10am subscribers"**
(`6aa02df41263cd9bcbd7e061`). The welcome email is a Flodesk **workflow**.

**The critical limitation, proven by testing:** Flodesk's *"added to segment"*
workflow trigger **does NOT fire for API-driven segment additions** — only for
signups through a **native Flodesk form**. Adding a subscriber via the API (even an
already-confirmed one, freshly added to the segment) never enrolls them in the
welcome workflow. Flodesk workflows are also **single-entry** by default, so a
subscriber added while `unconfirmed` burns their one enrollment and can never be
re-enrolled.

We also can't relay to a Flodesk form server-side: the form markup uses a **CSRF
token plus scrambled, randomized decoy field names** that only their JS can decode.

**Therefore every subscribe surface uses the embedded native Flodesk form**
(`components/FlodeskForm.tsx`, form id `6aa0ae9d7f5858181ac2e7a0`). Multiple
instances on one page are fine — the component generates a unique container id via
`useId()`. It appears in: the homepage, the footer, the 3-second popup
(`SubscribePopup`), the nav/banner overlay, and the members gate.

Flodesk API (`lib/subscribe.ts`) still exists but is effectively **dormant** — it
can create subscribers and add them to segments, but it cannot trigger the welcome.
To welcome an imported list, send a **one-time Flodesk campaign** (its report is
also the only delivery confirmation; there is no send-activity API).

**Members gate** (`components/NewsletterGate.tsx`): Culture/Travel are gated behind
the `nl_ok` cookie (`lib/newsletter-gate.ts`). The gate renders the Flodesk form and
watches it for `[data-ff-el="success"]` / `data-ff-stage="success"`, then sets the
cookie client-side and refreshes. ⚠️ **Known issue:** subscribers who sign up via
the popup/footer/banner Flodesk forms never get the cookie, so the gate does not
recognise them and repeatedly asks them to subscribe. Cookie-based gating is
unreliable without real user accounts. The recommended fix (pending client sign-off)
is to open Culture and Travel to everyone.

---

## Supabase

Project `dfaxqscmdsbovxojmljr`. Tables: `newsletter_signups` (email, name, source),
`clicks` (first-party outbound click log), plus auth/wishlist.

⚠️ The app only holds the **anon** key, and **RLS blocks reading
`newsletter_signups` with it** — a query returns `[]` even when rows exist. To read
the real list you need the dashboard or a `service_role` key.

---

## House rules (content)

- **No em-dashes, ever** — not `—`, not `–`. Use periods or commas. This applies to
  all site copy, emails and newsletters. Client-supplied copy gets converted, and
  flag it when you do.
- Editorial voice: understated, specific, unhurried. Short sentences are fine.
- **Product images are normalized**: trimmed to content bbox then padded to ~82% of
  a 3:4 frame, so every product reads at one consistent size in the grid.
- Never republish third-party press photos (e.g. Guardian article images) on the
  site — they're copyrighted and logo-stamped. Source official/clean imagery.

---

## Verifying work

There is no test suite. Verify visually against production with Playwright
(installed globally):

```bash
PW=$(npm root -g)/playwright   # then require(PW) in a node -e script
```

Useful cookies/flags when testing: set `nl_ok=1` to bypass the members gate and to
suppress the 3-second popup; click "Essential only"/"Accept all" to control consent.

> **Sandbox caveat:** this environment blocks outbound tracking beacons
> (`facebook.com/tr`, Google Analytics collect, Flodesk form submits). You can verify
> that tags *load and configure* correctly, but not that the beacon lands. Final
> confirmation has to come from Meta Test Events / GA Realtime / a real inbox.

---

## Open items

- Culture/Travel gate: decide whether to remove it (recommended) — see above.
- Homepage redesign requested by Silke: an "Our Picks of the Week" band (coloured
  background, headline, white square rotating 3 items at 1s each) plus a second
  featured edit (Beauty/Interior/Men). Needs decisions on the pick source and category.
- Flodesk sending domain is not authenticated → emails land in spam. Fix with the
  DKIM/CNAME records from Flodesk → Account → Domain authentication.
- Several products still lack prices / exact affiliate URLs.
