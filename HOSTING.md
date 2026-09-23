# Hosting & handover — 10amanywhere.com

How to put this site live under 10am's own ownership, and how the three founders
update the edit themselves. Everything below is created **in 10am's name**;
Content Systems is added as a collaborator. If our engagement ever ends, 10am
keeps the entire stack with nothing to untangle.

---

## 1. The ownership model (read first)

Five accounts run the site. Create each one logged in as **10am** (use
info@10amanywhere.com), then invite Korede/Sanjana as members. That way the
logins, the domain, the content, and the data all belong to 10am.

| Service | What it holds | Who needs to log in |
|---|---|---|
| **Vercel** | Hosting (the live website) | Us (deploys), 10am (owner) |
| **Sanity** | All content: edits, products, prices, images | The 3 founders (daily), us |
| **Supabase** | Accounts, wishlists, click data, newsletter list | Us (setup), 10am (owner) |
| **Resend** | Sends the newsletter/auth emails | Us (setup), 10am (owner) |
| **Domain registrar** | 10amanywhere.com | 10am (owner) |

Plus the affiliate networks (section 6) and analytics (section 7).

---

## 2. Create the accounts (about an hour, once)

1. **Sanity** — <https://sanity.io>. Sign in as 10am, create project **10am**, dataset **production**. Copy the **Project ID**. Members → invite Silke, Alexandra, Corinna (role: Editor) and us (Administrator).
2. **Supabase** — <https://supabase.com>. New project **10am** (pick the EU/Frankfurt region for GDPR). Copy **Project URL** and **anon public key** from Settings → API.
3. **Resend** — <https://resend.com>. Add and verify the domain 10amanywhere.com (DNS records they give you). Create an API key.
4. **Vercel** — <https://vercel.com>. We connect the Git repo here (section 4).
5. **Domain** — keep 10amanywhere.com where it is registered; you only need login access to change DNS at launch.

---

## 3. Put the content live (Sanity Studio) — this is how the founders update items

The website reads its content from **Sanity Studio**, a friendly editor with no
code. Setup is one-time; after that the founders publish twice a week in ~15
minutes.

**Stand up the Studio (once):**
```bash
cd studio
export SANITY_STUDIO_PROJECT_ID=<the project id from step 2.1>
npm install
npm run deploy        # pick a name, e.g. 10am  ->  https://10am.sanity.studio
```
Then invite the founders in the Sanity project (Members). They log in at
**https://10am.sanity.studio** (and `10amanywhere.com/studio` will redirect there
once `NEXT_PUBLIC_SANITY_STUDIO_URL` is set in step 4).

**Publishing an edit (the twice-weekly routine):**
1. New **Edit** → add the hero collage images and a one-line description.
2. For each piece: reuse an existing **Product** or add one — brand, name, price, photo, the retailer **affiliate URL**, and **Department** (women / men / unisex). Mark 1–2 as grid size 2×2 to feature them.
3. Add the products to the Edit, set status **Published**.

The homepage updates itself. The previous edit moves to the archive. Changing a
price or swapping a product is just editing that Product, no developer needed.

> Until the founders add their own products, the site shows our seed edit so it
> is never blank.

---

## 4. Deploy the website (Vercel)

1. Push this folder to a Git repo in 10am's GitHub (or ours, then transfer).
2. Vercel → **New Project** → import the repo. Framework auto-detects Next.js.
3. Add **Environment Variables** (Settings → Environment Variables), from `.env.local.example`:
   ```
   NEXT_PUBLIC_SANITY_PROJECT_ID     = <sanity project id>
   NEXT_PUBLIC_SANITY_DATASET        = production
   NEXT_PUBLIC_SANITY_STUDIO_URL     = https://10am.sanity.studio
   NEXT_PUBLIC_SUPABASE_URL          = <supabase project url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY     = <supabase anon key>
   RESEND_API_KEY                    = <resend key>
   NEWSLETTER_FROM                   = 10am <hello@10amanywhere.com>
   ```
4. **Deploy.** You get a staging URL (e.g. `10am.vercel.app`) to review.
5. **Custom domain:** Vercel → Domains → add `10amanywhere.com` and `www`. Vercel shows the DNS records. At the registrar, point the domain at Vercel (an A record / CNAME as instructed). SSL is automatic. This is the only registrar change; do it at launch to cut over from the old Hostinger site.

Every future `git push` redeploys automatically. Content changes in Sanity show
up without any deploy.

---

## 5. Turn on accounts, wishlist & click tracking (Supabase)

1. Supabase → SQL Editor → paste and run `supabase/migrations/0001_init.sql`. This creates the `users`, `wishlists`, `clicks`, and `newsletter_signups` tables with row-level security.
2. Supabase → Authentication → URL Configuration → set Site URL to `https://10amanywhere.com` and add `https://10amanywhere.com/auth/callback` as a redirect URL.
3. Once the env vars from step 4 are set, magic-link login, the saved wishlist, the newsletter, and the `/go/` affiliate click log all go live. The click log is what lets 10am tell a brand "we sent you 412 visits last month" independent of any network.

---

## 6. Affiliate networks (apply on 10am's behalf)

Apply once the site is live (they want to see a real site). Each product's
**affiliate URL** in Sanity is the network's deep link for that brand.

- **Awin** — Sézane, Smallable, GetYourGuide, Reformation, bookshop.org, Stoffkontor, NordicNest
- **CJ Affiliate** — Mytheresa, LuisaViaRoma, Vestiaire Collective
- **Rakuten** — NET-A-PORTER, MR PORTER, Mr & Mrs Smith, Abask
- **RewardStyle / LTK** and **Skimlinks** (Skimlinks auto-monetises any unmatched link)

---

## 7. Analytics (optional, recommended)

- **Plausible** (<https://plausible.io>, EU-hosted, cookie-free) or **GA4**. Add the snippet later; the consent banner already gates non-essential cookies.
- **Google Search Console** — verify 10amanywhere.com to watch search traffic.

---

## 8. Still needed from 10am before public launch

- Imprint details: **GbR registration number, VAT number, registered address** (placeholders are marked on `/imprint`).
- Confirm the **Bembo** font licence is the final one (it is embedded now).
- The **men's products + affiliate links** to replace the placeholder cards.
- A decision on **Living vs Men** as the 6th category (the build currently follows Silke's mockup: Men, no Living).

---

## 9. What "done" looks like

Live at 10amanywhere.com on Vercel, content edited by the founders in Sanity,
accounts and click tracking running in Supabase, newsletter sending via Resend,
affiliate links earning, and the whole stack owned by 10am with us as
collaborators. Ongoing support and two strategy calls a month are the €300
maintenance package.
