# 10am — anywhere

Production build of [10amanywhere.com](https://10amanywhere.com) for 10am anywhere UG (haftungsbeschränkt), by Content Systems.ai. A twice-weekly curated affiliate edit. Stack and scope follow `10am_build_context.md` (kept in ~/Downloads).

## Stack

- **Next.js 14** (App Router, TypeScript) + **Tailwind** tokens
- **Sanity** — content (Edit, Product, Article, CityGuide, Editor, Category)
- **Supabase** — auth (magic link), wishlist, affiliate click log, newsletter
- **Resend** — transactional email
- **Vercel** — hosting

Every integration is **env-gated**. With no `.env.local`, the site renders from `lib/seed.ts` and the wishlist uses localStorage, so it runs with zero cloud setup. Add an env block to switch each service on.

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
cp .env.local.example .env.local   # then fill in as accounts come online
```

## What is built

- **Homepage** matching the approved Vacation Wardrobe design with Silke's feedback applied: a **compact landscape masthead** (products clear the fold) and a **Men** section (6th category in nav/footer + a dedicated "for men" edit band with a Women | Men toggle). Men cards are placeholders pending real product imagery/links.
- **`/go/[slug]`** affiliate redirect + first-party click log (writes to Supabase `clicks` when configured, always 302s). This is the data foundation for direct brand outreach.
- **Wishlist** (`/wishlist`) — optimistic, localStorage now, Supabase write-through when a reader is signed in.
- **Newsletter** — server action writing to Supabase `newsletter_signups` + Resend confirmation.
- **Search / membership / menu** overlays, and the live **"Always 10am somewhere"** timezone band.

### Layout decision still open
Silke's mockup shows **Men in place of Living** (6 categories: Fashion, Interior, Beauty, Culture, Travel, Men). Confirm whether Living returns (would make 7). Adjust `CATEGORIES` in `components/Nav.tsx` and `lib/seed.ts`.

## Turning on the services

**Sanity:** create the project (in 10am's name), set `NEXT_PUBLIC_SANITY_PROJECT_ID`. Schema lives in `sanity/schemas/index.ts` (includes the `department` field for Men). Switch `lib/content.ts` from seed to the GROQ queries in `lib/sanity/queries.ts` (already written). Add the embedded Studio at `/studio` via `next-sanity` when ready.

**Supabase:** create the project, set `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`, run `supabase/migrations/0001_init.sql` in the SQL editor. Tables ship with row-level security; clicks/newsletter allow anonymous insert, wishlist/users are owner-scoped.

**Resend:** set `RESEND_API_KEY` and `NEWSLETTER_FROM`.

## Accounts to create (all in 10am's name; we are collaborators)

**Infra:** Sanity, Vercel, Supabase, Resend, Google Search Console, Plausible (or GA4), domain-registrar access, Meta Business Suite.

**Affiliate networks** (apply on their behalf):
- **Awin** — Sézane, Smallable, GetYourGuide, Reformation, bookshop.org, Stoffkontor, NordicNest
- **CJ Affiliate** — Mytheresa, LuisaViaRoma, Vestiaire Collective
- **Rakuten** — NET-A-PORTER, MR PORTER, Mr & Mrs Smith, Abask
- **RewardStyle / LTK** and **Skimlinks** (Skimlinks = auto-monetise safety net)

**From client:** GbR registration number, VAT number, registered address (Imprint); confirm Bembo is the licensed final font; About/Contact copy; the Men products + affiliate links.

## Not yet built (next passes)

Category pages (`/fashion`, `/men`, …), article + city-guide templates, magic-link auth UI, Klaro cookie consent, Imprint/Privacy/Terms pages, affiliate-disclosure component, `next/image` optimisation, Lighthouse + BFSG accessibility pass. The current product images use plain `<img>` for design fidelity during client review.
