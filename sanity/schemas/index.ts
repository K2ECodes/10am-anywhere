// Sanity schema definitions for 10am, expressed as plain objects so they can be
// typechecked without the full `sanity` package. When the embedded Studio is
// wired (see README), wrap each with defineType and pass `schemaTypes` to the
// Studio config. Field set follows 10am_build_context.md section 6, plus the
// `department` field added to support the Men category.

export const category = {
  name: "category",
  title: "Category",
  type: "document",
  fields: [
    { name: "name", title: "Name", type: "string" },
    { name: "slug", title: "Slug", type: "slug", options: { source: "name" } },
    { name: "description", title: "Description", type: "text" },
  ],
};

export const product = {
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    { name: "brand", title: "Brand", type: "string" },
    { name: "productName", title: "Product name", type: "string" },
    { name: "slug", title: "Slug", type: "slug", options: { source: (d: any) => `${d.brand} ${d.productName}` } },
    { name: "price", title: "Price", type: "number" },
    { name: "currency", title: "Currency", type: "string", initialValue: "EUR" },
    { name: "primaryImage", title: "Primary image", type: "image", options: { hotspot: true }, validation: (r: any) => r.required() },
    { name: "additionalImages", title: "Additional images", type: "array", of: [{ type: "image" }] },
    {
      name: "department",
      title: "Department",
      type: "string",
      options: { list: ["women", "men", "unisex"], layout: "radio" },
      initialValue: "women",
    },
    { name: "category", title: "Category", type: "reference", to: [{ type: "category" }] },
    {
      name: "sourceUrl",
      title: "Paste product link → auto-fills brand, name, price on save",
      description: "Paste the retailer/brand product link. Brand, name, price and the shop link fill in automatically.",
      type: "url",
    },
    { name: "affiliateUrl", title: "Affiliate URL (auto-set from the product link)", type: "url" },
    {
      name: "network",
      title: "Affiliate network",
      type: "string",
      options: { list: ["awin", "cj", "rakuten", "rewardstyle", "skimlinks", "direct"] },
    },
    {
      name: "gridSize",
      title: "Grid size",
      type: "string",
      options: { list: ["1x1", "2x1", "1x2", "2x2"] },
      initialValue: "1x1",
    },
    { name: "tags", title: "Tags", type: "array", of: [{ type: "string" }] },
    {
      name: "webExclusive",
      title: "Web exclusive (extra piece, not in the Instagram look)",
      description:
        "Tick for the extra products added to the website that weren't in the Instagram edit. Shows a subtle 'web exclusive' tag so it's clear which pieces are the look and which are extras.",
      type: "boolean",
      initialValue: false,
    },
    { name: "notes", title: "Editorial note", type: "array", of: [{ type: "block" }] },
    { name: "active", title: "Active", type: "boolean", initialValue: true },
  ],
};

export const edit = {
  name: "edit",
  title: "Edit",
  type: "document",
  fields: [
    { name: "title", title: "Title", type: "string" },
    { name: "slug", title: "Slug", type: "slug", options: { source: "title" } },
    { name: "issueNumber", title: "Issue number", type: "number" },
    { name: "eyebrow", title: "Eyebrow", type: "string", initialValue: "The Edit" },
    { name: "publishDate", title: "Publish date", type: "datetime" },
    { name: "description", title: "Description", type: "text" },
    {
      name: "heroVariant",
      title: "Hero variant",
      type: "string",
      options: { list: ["cover", "collage"], layout: "radio" },
      initialValue: "collage",
    },
    { name: "heroCoverImage", title: "Hero cover image", type: "image", options: { hotspot: true } },
    { name: "heroCollage", title: "Hero collage images", type: "array", of: [{ type: "image" }] },
    {
      name: "heroCoverMobile",
      title: "Mobile cover (phone only)",
      description:
        "Optional. A phone-shaped (square or portrait) version of the cover collage, shown ONLY on phones so it doesn't shrink. If empty, the main cover is used on phones too.",
      type: "image",
      options: { hotspot: true },
    },
    {
      name: "featuredProducts",
      title: "Featured products",
      type: "array",
      of: [{ type: "reference", to: [{ type: "product" }] }],
      validation: (r: any) => r.max(60),
    },
    {
      name: "sections",
      title: "Sections (grouped edit)",
      description:
        "Optional. For a grouped edit (e.g. Back to School by school level), each section has a title and its own product list. When present, the homepage renders these instead of the flat Featured products.",
      type: "array",
      of: [
        {
          type: "object",
          name: "editSection",
          fields: [
            { name: "title", title: "Section title", type: "string" },
            {
              name: "products",
              title: "Products",
              type: "array",
              of: [{ type: "reference", to: [{ type: "product" }] }],
              validation: (r: any) => r.max(60),
            },
          ],
          preview: { select: { title: "title" } },
        },
      ],
    },
    {
      name: "status",
      title: "Status",
      type: "string",
      options: { list: ["draft", "scheduled", "published"], layout: "radio" },
      initialValue: "draft",
    },
  ],
};

export const editor = {
  name: "editor",
  title: "Editor",
  type: "document",
  fields: [
    { name: "name", title: "Name", type: "string" },
    { name: "role", title: "Role", type: "string" },
    { name: "bio", title: "Bio", type: "text" },
    { name: "portrait", title: "Portrait", type: "image", options: { hotspot: true } },
    { name: "recommendations", title: "Personal recommendations", type: "array", of: [{ type: "reference", to: [{ type: "product" }] }] },
  ],
};

export const article = {
  name: "article",
  title: "Article",
  type: "document",
  fields: [
    { name: "title", title: "Title", type: "string" },
    { name: "titleHtml", title: "Display title (allows <em> emphasis)", type: "string" },
    { name: "slug", title: "Slug", type: "slug", options: { source: "title" } },
    { name: "category", title: "Category", type: "reference", to: [{ type: "category" }] },
    { name: "dek", title: "Standfirst", type: "text" },
    { name: "heroImage", title: "Hero image", type: "image", options: { hotspot: true } },
    { name: "author", title: "Author", type: "string" },
    { name: "date", title: "Dateline", type: "string" },
    { name: "readingTime", title: "Reading time", type: "string" },
    { name: "body", title: "Body (one paragraph per item)", type: "array", of: [{ type: "text" }] },
    // Recurring "column" format (e.g. "Three Rooms Worth the Trip"): a run of
    // labelled mini-features, each with its own kicker, heading, image, blurb and
    // outbound links. Optional — flat articles just use body/heroImage as before.
    {
      name: "sections",
      title: "Sections (recurring column format)",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "kicker", title: "Kicker (e.g. The Hotel)", type: "string" },
            { name: "heading", title: "Heading (place / name + location)", type: "string" },
            { name: "image", title: "Image", type: "image", options: { hotspot: true } },
            { name: "body", title: "Blurb (one paragraph per item)", type: "array", of: [{ type: "text" }] },
            {
              name: "links",
              title: "Links",
              type: "array",
              of: [
                {
                  type: "object",
                  fields: [
                    { name: "label", title: "Label (e.g. Stay, Discover)", type: "string" },
                    { name: "url", title: "URL", type: "url" },
                  ],
                  preview: { select: { title: "label", subtitle: "url" } },
                },
              ],
            },
          ],
          preview: { select: { title: "heading", subtitle: "kicker", media: "image" } },
        },
      ],
    },
    { name: "shopThisStory", title: "Shop this story", type: "array", of: [{ type: "reference", to: [{ type: "product" }] }] },
    { name: "gated", title: "Members only", type: "boolean", initialValue: false },
  ],
};

const place = {
  name: "place",
  title: "Place",
  type: "object",
  fields: [
    { name: "name", title: "Name", type: "string" },
    { name: "blurb", title: "Blurb", type: "text" },
    { name: "affiliateUrl", title: "Affiliate link", type: "url" },
  ],
};

export const cityGuide = {
  name: "cityGuide",
  title: "City guide",
  type: "document",
  fields: [
    { name: "city", title: "City", type: "string" },
    { name: "country", title: "Country", type: "string" },
    { name: "slug", title: "Slug", type: "slug", options: { source: "city" } },
    { name: "category", title: "Category", type: "reference", to: [{ type: "category" }] },
    { name: "heroImage", title: "Hero image", type: "image", options: { hotspot: true } },
    { name: "intro", title: "Editorial intro (one paragraph per item)", type: "array", of: [{ type: "text" }] },
    { name: "gated", title: "Members only", type: "boolean", initialValue: true },
    { name: "stay", title: "Stay", type: "array", of: [{ type: "place" }] },
    { name: "eat", title: "Eat", type: "array", of: [{ type: "place" }] },
    { name: "do", title: "Do", type: "array", of: [{ type: "place" }] },
    { name: "shop", title: "Shop", type: "array", of: [{ type: "place" }] },
    { name: "gallery", title: "Photo gallery", type: "array", of: [{ type: "image" }] },
  ],
};

export const schemaTypes = [category, product, edit, editor, article, cityGuide, place];
