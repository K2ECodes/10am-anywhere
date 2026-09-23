# 10am client call — plan + Sanjana's demo script

**Live site:** https://10am-anywhere.vercel.app
**Editor CMS (Studio):** https://tenam-anywhere.sanity.studio

---

## Objective
Show 10am that the site is **launch-ready and functional** (real products, real shop links), that **they own and control it**, and that the **weekly upload is genuinely easy** (drop image + link → the rest fills itself). Leave them confident to proceed.

---

## Pre-call setup (Korede — 5 min before)
1. **Enable drafts on the auto-fill webhook** (so fields fill while editing, not only on publish):
   sanity.io/manage → 10am → API → Webhooks → open **enrich-product** → turn **Drafts ON** → Save.
2. **Log into the Studio** (https://tenam-anywhere.sanity.studio) in a tab, ready.
3. **Dry-run the automation once:** new Product → paste a Taschen/Diptyque link → confirm brand/name/price fill in ~5s → delete it.
4. Open the **live site** in another tab.
5. Have **one product link ready to paste** that is NOT bot-blocked. **Use a brand store** — e.g.
   `https://www.taschen.com/en/books/photography/01104/helmut-newton-sumo-20th-anniversary-edition/`
   (Avoid Mytheresa / Farfetch / Mr Porter on the live demo — they block the auto-read.)

---

## Call flow (≈15 min)

### 1. The site (the main event, ~6 min) — *show, don't tell*
1. **Homepage** — "this is the twice-weekly edit. Same as your Instagram, on your own site." Scroll the product grid.
2. **Click a product** → it lands on the real retailer. "Every item links out to a real shop — the site already works for affiliate review. We earn the commission via the link."
3. **Categories** (top nav):
   - **Fashion / Interior / Beauty** — the product edits.
   - **Travel** → open **10am in Lisbon** — a city guide (cover, intro, Stay/Eat/Do, photos).
   - **Culture** → "different on purpose — no products, just our notes." Open **Three rooms worth the trip**.
   - **Men** — the men's edit.
4. **Subscribe / Join the Club** — the membership (logo-in-circle), and the **Wishlist**.
5. (Optional) open it on a **phone** — clean, nothing cut off.

**Talking points:** it's *their own* custom site (not a template), they own everything, no platform fees, fast, mobile-perfect.

### 2. They own & control it (the CMS, ~3 min)
1. Open the **Studio**. Show the current edit + products. "This is where your team works — no code."
2. "Publishing an edit takes about 15 minutes, twice a week. Everything lives in your account."

### 3. The weekly upload — the wow (~4 min)
1. In the Studio: **Product → Create new**.
2. **Paste the product link** into "Paste product link". 
3. **Drop in the cropped image** (Pepa's crop).
4. **Wait ~5 seconds** → **brand, name, price fill in automatically.** "No typing each item with a name and price — the link does it. Pepa just crops the image like she already does."
5. Publish. "It's on the site instantly."

**Talking points:** this is the AI-light automation they asked for — built into *their* site, no monthly tools. (If asked about Instagram: "we read the product link, not the photo — that's what makes it reliable.")

### 4. Close (~2 min) — what's left to go fully live
- **Domain:** Silke adds the DNS records (the guide we sent) → site moves to 10amanywhere.com + emails send from 10am.
- **Affiliate approvals:** Awin / CJ / Rakuten / Skimlinks — the functional site is what they want to see; we apply on 10am's behalf.
- Then: full launch, twice-weekly rhythm.

---

## If the live auto-fill hiccups (fallback)
- If fields don't fill in ~10s: "it populates within a few seconds — here's one already done" → show an existing product that has brand/name/price.
- Reason it can lag: some big retailers (Mytheresa, Farfetch, Mr Porter) block the auto-read; **brand-store links always work** — that's why we use one for the demo.

## Honest notes (for Korede, not the client)
- Auto-read works on retailers exposing standard product data and not blocking servers (brand stores, Taschen, Diptyque, La Mer, Loro Piana…). Bot-hostile retailers → Pepa types name/price (link + image + commission still work). A scraping proxy can fix this later if they want it universal.
- Real AI (Claude) is a later add-on for auto-categorising + writing the editorial blurb — not needed for the demo.
