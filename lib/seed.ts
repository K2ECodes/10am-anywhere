import type {
  ClockCity,
  CollageTile,
  Department,
  Edit,
  EditorialFeature,
  MenEdit,
  Product,
} from "./types";

// Seed content mirrors the approved Vacation Wardrobe prototype. It renders the
// site until a Sanity project is connected (see lib/content.ts).

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^\x00-\x7F]/g, "") // drop combining marks left by NFD (é -> e)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Stand-in affiliate destination so the /go redirect is demonstrable before the
// real affiliate links are loaded. Replace with the network deep link in Sanity.
function placeholderAffiliate(brand: string, name: string): string {
  return "https://www.google.com/search?q=" + encodeURIComponent(`${brand} ${name}`);
}

type Row = [brand: string, name: string, price: number, image?: string];

function buildProducts(rows: Row[], department: Department, category: string): Product[] {
  return rows.map(([brand, name, price, image]) => ({
    slug: slugify(`${brand}-${name}`),
    brand,
    name,
    price,
    currency: "EUR",
    image: image ? `/images/${image}` : undefined,
    department,
    category,
    affiliateUrl: placeholderAffiliate(brand, name),
    network: "skimlinks",
    gridSize: "1x1",
    active: true,
  }));
}

const womenRows: Row[] = [
  ["Maria de la Orden", "Striped Tinta day dress", 250, "10am_editorial-019-4a1afc656c29.png"],
  ["Alémais", "Verdant mini dress", 410, "10am_editorial-020-9f640aa1a566.png"],
  ["By Malene Birger", "Powder shawl blazer", 395, "10am_editorial-006-fb202e351d3a.png"],
  ["Leo Lin", "Rose appliqué shift", 845, "10am_editorial-021-b68643f6eb78.png"],
  ["Gucci", "Flora silk square", 420, "10am_editorial-008-b15083449b35.png"],
  ["Lola Hats", "Raffia bucket", 235, "10am_editorial-013-69424477ae54.png"],
  ["Sir.", "Asymmetric one-piece", 320, "10am_editorial-010-74aead78dad2.png"],
  ["Self-Portrait", "Lace pleated dress", 565, "10am_editorial-007-84598d42959c.png"],
  ["Self-Portrait", "Pleated halter midi", 480, "10am_editorial-009-b41695b80c60.png"],
  ["Toteme", "Striped poplin shirt", 290, "10am_editorial-011-ef7edd055a10.png"],
  ["Khaite", "Open-knit short sleeve", 540, "10am_editorial-012-052c59ede5c1.png"],
  ["Wales Bonner", "Greenhouse trouser, mustard", 690, "10am_editorial-015-dbe13d3b1045.png"],
  ["La DoubleJ", "Pagoda striped trouser", 525, "10am_editorial-016-b8b06cf0162b.png"],
  ["Etro", "Banded wide trouser", 610, "10am_editorial-017-2656d4a4f88d.png"],
  ["Marni", "Colour-block halter", 480, "10am_editorial-014-5740b9595ce9.png"],
  ["Jil Sander", "Multistripe ribbed tank", 295, "10am_editorial-018-03c512314dea.png"],
];

const menRows: Row[] = [
  ["Drake's", "Linen camp-collar shirt", 245],
  ["Officine Générale", "Pleated wool trouser", 310],
  ["A.P.C.", "Petit Standard denim", 195],
  ["Mr P.", "Suede court trainer", 290],
  ["Sunspel", "Riviera cotton polo", 120],
  ["Anderson's", "Woven leather belt", 135],
  ["De Bonne Facture", "Cotton-linen overshirt", 380],
  ["Baracuta", "G9 Harrington jacket", 395],
];

const collage: CollageTile[] = [
  { image: "/images/iconic-vintage-finds.jpg", alt: "Iconic vintage finds", caption: "Iconic vintage", num: "01" },
  { image: "/images/yellow-navy-edit.jpeg", alt: "Yellow and navy, striped and scalloped", caption: "Yellow & navy", num: "02" },
  { image: "/images/navy-yellow-balance.jpg", alt: "Navy and yellow, the perfect balance", caption: "Bold & timeless", num: "03" },
];

export const seedEdit: Edit = {
  title: "Vacation Wardrobe",
  titleLines: ["Vacation", "Wardrobe"],
  eyebrow: "The Edit",
  issue: "Issue No. 01",
  description:
    "A summer edit gathered from the brands and ateliers we return to season after season. A new chapter every month.",
  collage,
  products: buildProducts(womenRows, "women", "Fashion"),
};

export const seedMenEdit: MenEdit = {
  kicker: "Men",
  titleLines: ["Men", ""],
  dek: "",
  products: buildProducts(menRows, "men", "Men"),
};

export const seedEditorialFeature: EditorialFeature = {
  tag: "Editorial / 01",
  kicker: "A 10am editorial",
  titleHtml: "Iconic <em>vintage</em><br>finds.",
  dek:
    "A small archive of the pieces that have outlasted their season, their decade, their owner. Pulled from European resellers, private wardrobes, and a handful of quiet ateliers we trust.",
  meta: ["Edit 02 / Summer", "9 pieces", "3 min read"],
  body: [
    "The Hermès Kelly in salmon pink. The boxy Chanel quilted flap, returning every spring. A grey peplum Mugler that still looks five years younger than the room it walks into. Each one chosen for the same reason: it carries the kind of patina you cannot buy new.",
    "The full edit, with provenance notes and condition reports for each piece, is open on the site this week only.",
  ],
  cta: "Read the edit →",
  slug: "iconic-vintage-finds",
  image: "/images/iconic-vintage-finds.jpg",
};

export const clockCities: ClockCity[] = [
  { city: "Los Angeles", tz: "America/Los_Angeles", abbr: "PDT" },
  { city: "New York", tz: "America/New_York", abbr: "EDT" },
  { city: "Berlin", tz: "Europe/Berlin", abbr: "CEST" },
  { city: "Dubai", tz: "Asia/Dubai", abbr: "GST" },
  { city: "Tokyo", tz: "Asia/Tokyo", abbr: "JST" },
  { city: "Sydney", tz: "Australia/Sydney", abbr: "AEST" },
];

// Sample lux pieces filling out the other category grids for now (placeholder
// imagery). Swap for real products + affiliate links in the Studio.
const interiorRows: Row[] = [
  ["Fornasetti", "Tema e Variazioni plate", 295],
  ["Ginori 1735", "Oriente Italiano teacup", 150],
  ["Saint-Louis", "Tommy crystal tumbler", 230],
  ["Loro Piana", "Cashmere throw", 1950],
];
const beautyRows: Row[] = [
  ["La Mer", "Crème de la Mer", 210],
  ["Augustinus Bader", "The Rich Cream", 265],
  ["Diptyque", "Baies scented candle", 68],
  ["Sisley Paris", "Black Rose cream mask", 165],
];
// Culture has no products — it's editorial (see seedCultureArticles below).

export const seedInteriorProducts = buildProducts(interiorRows, "unisex", "Interior");
export const seedBeautyProducts = buildProducts(beautyRows, "unisex", "Beauty");

export const allSeedProducts: Product[] = [
  ...seedEdit.products,
  ...seedMenEdit.products,
  ...seedInteriorProducts,
  ...seedBeautyProducts,
];

// Category nav. Order matches Silke's mockup (Men in, Living out). The homepage
// women's edit is tagged Fashion; other categories show an editorial empty state
// until their products are published.
export const seedCategories: import("./types").Category[] = [
  { name: "Fashion", slug: "fashion", description: "The clothes, shoes, and bags of the week's edit." },
  { name: "Interior", slug: "interior", description: "Objects and furniture for a considered home." },
  { name: "Beauty", slug: "beauty", description: "Skin, scent, and the small rituals." },
  { name: "Culture", slug: "culture", description: "What we are reading, watching, and listening to." },
  { name: "Travel", slug: "travel", description: "Where we are going, and what we pack." },
  { name: "Men", slug: "men", description: "The same eye, a different wardrobe." },
];

// Listed alphabetically by first name; no bios under the names (per client).
export const seedFounders: import("./types").Founder[] = [
  { name: "Alexandra Cukierman", role: "Co-founder", bio: "" },
  { name: "Corinna Möell", role: "Co-founder", bio: "" },
  { name: "Silke Rumpelhardt", role: "Co-founder", bio: "" },
];

export const seedArticle: import("./types").Article = {
  slug: "iconic-vintage-finds",
  title: "Iconic vintage finds",
  titleHtml: "Iconic <em>vintage</em> finds.",
  category: "Fashion",
  dek:
    "A small archive of the pieces that have outlasted their season, their decade, their owner.",
  heroImage: "/images/iconic-vintage-finds.jpg",
  author: "Silke Rumpelhardt",
  date: "Friday, Berlin",
  readingTime: "3 min read",
  body: [
    "The Hermès Kelly in salmon pink. The boxy Chanel quilted flap, returning every spring. A grey peplum Mugler that still looks five years younger than the room it walks into. Each one chosen for the same reason: it carries the kind of patina you cannot buy new.",
    "We pull from European resellers, private wardrobes, and a handful of quiet ateliers we trust. Every piece is checked in person, photographed as it is, and sold with provenance notes and a condition report. Nothing is retouched into something it is not.",
    "The full edit is open on the site this week only. When a piece is gone, it is gone, the way the best things tend to be.",
  ],
  sections: [],
  shopThisStory: seedEdit.products.slice(0, 4),
};

// Culture is editorial, like Travel — short guides, no products.
export const seedCultureArticles: import("./types").Article[] = [
  {
    slug: "rooms-worth-the-trip",
    title: "Three rooms worth the trip",
    titleHtml: "Three rooms <em>worth</em> the trip.",
    category: "Culture",
    dek: "The exhibitions we would cross a city for this season.",
    heroImage: "/images/culture/exhibition.jpg",
    author: "The editors",
    date: "This fortnight",
    readingTime: "2 min read",
    body: [
      "Yayoi Kusama, Gropius Bau, Berlin. The mirror rooms you queue an hour for and forget the queue the minute the door closes. Go on a weekday morning, early.",
      "Cecily Brown, Hamburger Bahnhof. Paint that refuses to sit still, hung in a hall built for trains. Loud, alive, and somehow exactly the right amount of too much.",
      "Pierre Bonnard, Fondation Beyeler, Basel. Worth the train. Colour as a way of remembering a room you once stood in.",
    ],
    sections: [],
    shopThisStory: [],
  },
  {
    slug: "what-is-in-our-ears",
    title: "What's in our ears",
    titleHtml: "What's in <em>our</em> ears.",
    category: "Culture",
    dek: "A podcast, a record, and one night out, for the next two weeks.",
    heroImage: "/images/culture/music.jpg",
    author: "The editors",
    date: "This fortnight",
    readingTime: "2 min read",
    body: [
      "The podcast: Articles of Interest, on the things we wear and why. Half an hour, the length of a good walk.",
      "The record: Hania Rani, the live takes. Piano for a slow morning, the kind that earns the name 10am.",
      "The night: the Philharmonie's late series on Friday. Bach before midnight, then the U-Bahn home through a quiet city.",
    ],
    sections: [],
    shopThisStory: [],
  },
];

// The "Iconic vintage finds" editorial (seedArticle) has been retired, so it is
// intentionally excluded here — leaving it in would resurface it as a Fashion
// editorial card via the seed fallback.
export const allSeedArticles: import("./types").Article[] = [...seedCultureArticles];

export const seedCityGuide: import("./types").CityGuide = {
  slug: "lisbon",
  city: "Lisbon",
  country: "Portugal",
  category: "Travel",
  heroImage: "/images/lisbon/hero.jpg",
  gated: true,
  gallery: [
    "/images/lisbon/belem.jpg",
    "/images/lisbon/alfama.jpg",
    "/images/lisbon/comercio.jpg",
    "/images/lisbon/view.jpg",
    "/images/lisbon/nata.jpg",
    "/images/lisbon/azulejo.jpg",
  ],
  intro: [
    "Lisbon at 10am is still deciding what kind of day it will be. The light is low and gold, the pastéis are warm, and the city has not yet filled with anyone but the people who live here.",
    "This is how we actually shop a place: where we stay, where we eat, what we do between, and the few shops worth changing your route for.",
  ],
  stay: [
    { name: "Santa Clara 1728", blurb: "Six rooms, lime plaster, and a breakfast table you will not want to leave." },
    { name: "Palácio Príncipe Real", blurb: "A townhouse hotel with a garden, in the neighbourhood you came for." },
  ],
  eat: [
    { name: "Prado", blurb: "Farm-led, low-lit, and the reason to book before you fly." },
    { name: "A Cevicheria", blurb: "Stand, wait, order the tiger's milk. Worth every minute of the queue." },
  ],
  do: [
    { name: "Gulbenkian garden", blurb: "An hour among the ponds before the museum opens." },
    { name: "Feira da Ladra", blurb: "Tuesday and Saturday. Come early, leave with one good thing." },
  ],
  shop: [
    { name: "Apaixonado", blurb: "Vintage with an editor's eye, off Príncipe Real." },
    { name: "A Vida Portuguesa", blurb: "The soaps, the tinned fish, the things to carry home." },
  ],
};

// ---- lookups (seed implementations behind lib/content.ts) ----

export function productsByCategory(slug: string): Product[] {
  const cat = seedCategories.find((c) => c.slug === slug);
  if (!cat) return [];
  return allSeedProducts.filter((p) => p.category === cat.name && p.active);
}

// Editorials (articles + city guides), each tagged to a category so they surface
// in the right section (e.g. "10am in Lisbon" under Travel).
export const seedEditorials: import("./types").EditorialRef[] = [
  ...allSeedArticles.map((a) => ({
    kind: "article" as const,
    slug: a.slug,
    title: a.title,
    image: a.heroImage,
    category: a.category,
    kicker: a.category === "Culture" ? "A 10am culture note" : "A 10am editorial",
  })),
  {
    kind: "guide" as const,
    slug: seedCityGuide.slug,
    title: `10am in ${seedCityGuide.city}`,
    image: seedCityGuide.heroImage,
    category: seedCityGuide.category,
    kicker: "A 10am city guide",
  },
];

export function editorialsByCategory(slug: string): import("./types").EditorialRef[] {
  const cat = seedCategories.find((c) => c.slug === slug);
  if (!cat) return [];
  return seedEditorials.filter((e) => e.category === cat.name);
}

// A photo grid for a category (Travel uses the Lisbon gallery).
export function galleryByCategory(slug: string): string[] {
  if (slug === "travel") return seedCityGuide.gallery;
  return [];
}
