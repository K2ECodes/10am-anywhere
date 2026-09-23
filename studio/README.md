# 10am Studio (the editorial CMS)

This is where the three founders publish edits, with no code. It is a standard
Sanity Studio that shares its schema with the website, so the two never drift.

## One-time setup (do this once, in 10am's name)

1. Create the Sanity project: <https://www.sanity.io> → sign in with the 10am Google/email account → create a project named **10am**, dataset **production**. Copy the **project ID**.
2. In `sanity.config.ts` (and `sanity.cli.ts`), set the project id, or export it:
   ```bash
   export SANITY_STUDIO_PROJECT_ID=your_project_id
   ```
3. Install and run locally:
   ```bash
   cd studio
   npm install
   npm run dev          # http://localhost:3333
   ```
4. Deploy the hosted Studio so editors can use it from anywhere:
   ```bash
   npm run deploy       # choose a hostname, e.g. 10am -> https://10am.sanity.studio
   ```
5. Invite the founders: Sanity project → Members → invite Silke, Alexandra, Corinna as editors.

## Connect the website to this content

In the website's `.env.local`, set:
```
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
```
and point `NEXT_PUBLIC_SANITY_STUDIO_URL` at the deployed Studio so `/studio` on the
live site opens it. The website reads published content automatically.

## Publishing an edit (the twice-weekly flow, ~15 minutes)

1. Open the Studio, create a new **Edit**, add the hero collage images, write the description.
2. For each product, reuse an existing **Product** or create one (brand, name, price, image, affiliate URL, department). Set 1 or 2 to grid size 2x2 to feature them.
3. Add the products to the Edit, set status to **Published**.

The site re-renders and the new edit becomes the homepage.
