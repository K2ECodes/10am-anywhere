/* One-off: apply "website new 2" travel + interior changes.
   - upload 6 travel hero photos + 3 interior product photos
   - create Paris/London/Milano city guides (published), delete Lisbon
   - swap hero photos on Palma/Marrakech/Menorca
   - add 3 missing Rattan interior products (luna chair, cherry object, parasol) */
const { createClient } = require("@sanity/client");
const fs = require("fs");
const path = require("path");

const c = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2026-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  perspective: "raw",
});

const TRAVEL_DIR = "/Users/korede2elite/Downloads/website new 2/Travel ";
const INT_DIR = "/Users/korede2elite/Downloads/website new 2/Rattan (Interior)";
const CAT_TRAVEL = "category-travel";
const CAT_INTERIOR = "category-interior";

const SMALL = new Set(["de","del","la","le","les","di","du","des","et","and","of","the","da","e","a","al"]);
function tc(raw) {
  const name = String(raw).replace(/[“”""]/g, "").trim();
  return name.split(/\s+/).map((w, i) =>
    w.split("/").map((part) => {
      if (/^[ivx]+$/i.test(part) && part.length <= 4) return part.toUpperCase();
      const low = part.toLowerCase();
      if (i > 0 && SMALL.has(low)) return low;
      return low.charAt(0).toUpperCase() + low.slice(1);
    }).join("/")
  ).join(" ");
}
let keyN = 0;
const places = (arr) => arr.map((n) => ({ _type: "place", _key: "p" + (keyN++).toString(36), name: tc(n) }));
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90);

async function uploadImage(file) {
  const buf = fs.readFileSync(file);
  const asset = await c.assets.upload("image", buf, { filename: path.basename(file) });
  return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
}

const GUIDES = [
  {
    id: "cityGuide-paris", city: "Paris", country: "France", img: "Paris.png",
    intro: ["The city we return to first. A weekend of grand hotels, cafe terraces, long lunches, and the museums we never tire of."],
    stay: ["LE BRISTOL","HOTEL D'AUBUSSON","LE GRAND MAZARIN","LA FANTAISIE","SO/PARIS","HÔTEL MADAME RÊVE"],
    eat: ["BONJOUR JACOB","CAFÉ DE FLORE","LE ROSTAND","TÉLESCOPE","LA PALETTE","CAFÉ HUGO","LE GRAND CAFÉ","DOKI DOKI","LAFAYETTE'S","KINUGAWA RIVE GAUCHE","LA PETIT LUTETIA","CHEZ GEORGE","MAXIM'S","BARONNE"],
    do: ["MUSÉE PICASSO","MUSÉE RODIN","BOURSE DE COMMERCE","MUSÉE DE LA VIE ROMANTIQUE","MUSÉE GUSTAVE MOREAU","MAM MUSÉE D'ART MODERNE","MUSÉE JACQUEMART ANDRÉ"],
    shop: ["HEURGON","NOSE PARIS","THE RED WHEELBARROW","MARIN MONTAGUT","MERCI","LE BONE MARCHÉ","LE SAMARITAINE"],
  },
  {
    id: "cityGuide-london", city: "London", country: "United Kingdom", img: "London.png",
    intro: ["Old-world rooms and new-world cooking, the shops we plan a day around, and the streets worth walking end to end."],
    stay: ["THE CADOGAN","BEAVERBROOK","THE CONNAUGHT","BROADWICK","NoMad","THE LASLETT","THE NED","THE MAYFAIR TOWNHOUSE","THE HOXTON"],
    eat: ["CINDER","THE BARBARY","THE CLOVE CLUB","BIBI","SERRA","CARBONE","THE HART","THE MAINE","DORIAN","SOMA SOHO","ARLINGTON","POON'S"],
    do: ["PAVILLION ROAD","PIMLICO ROAD","KINGS ROAD","SHOREDITCH","COLUMBIA ROAD","PORTOBELLO ROAD","MOUNT STREET","NEW BOND STREET","CARNABY STREET"],
    shop: ["LIBERTY","KIOBIRD","FERNANDO JORGE","ANNIE'S IBIZA","ANNA + NINA","JESSIE WESTERN","FORTNUM & MASON"],
  },
  {
    id: "cityGuide-milano", city: "Milano", country: "Italy", img: "Milano.png",
    intro: ["Design, aperitivo, and the quiet luxury Milan does better than anywhere. Where to stay, where to eat, and what to see."],
    stay: ["GRAND HOTEL ET DE MILAN","PORTRAIT MILANO","VICO HOTEL MILANO","NH COLLECTIVE MILANO CITYLIFE","CASA CIPRIANI","SENATO HOTEL MILANO","MAX BROWN MISSORI","CASA BRERA","THE CARLTON"],
    eat: ["OSTERIA DI BRERA","LA LATTERIA SAN MARCO","HORTO","SAINT AMBROEUS MILANO","PAPER MOON GIARDINO","BEEF BAR","IL BARETTO MILANO","LANGOSTERIA","ROVELLO","CARUSO NUOVO BISTROT"],
    do: ["FONDAZIONE PRADA","ADI MUSEUM","PINACOTECA DI BRERA","MIART","ANSELM KIEFER","ROBERT MAPPLETHROPE","I MACCIAIOLI"],
    shop: ["CONCEPT STORE 10 CORSO COMO","CONCEPT STORE ROSSANA ORLANDI","THE STORE","NILUFAR GALLERY","QUADRILATERO D'ORO","BRERA DISTRICT","NAVIGLI","CORSO GARIBALDI","GALLERIA VITTORIO EMANUELE II"],
  },
];

// existing guides that only need a new hero photo
const HERO_SWAPS = [
  { id: "b5292a8a-b870-4b95-88f2-ef4e5bb3c9ac", img: "Mallorca.png", city: "Palma" },
  { id: "c8a7f71f-ea0b-4fe8-b4e8-824998efb659", img: "Marrakech.png", city: "Marrakech" },
  { id: "9cf60efd-7673-44fe-abe9-c155bdc7a018", img: "Menorca.png", city: "Menorca" },
];

const INTERIOR = [
  { name: "Luna Chair", brand: "Popus Editions", file: "11.png", url: "https://www.pamono.ca/luna-chair-in-stained-rattan-by-popus-editions" },
  { name: "Cherry Rattan Object", brand: "Anna + Nina", file: "13.png", url: "https://www.anna-nina.nl/products/cherry-rattan-object-1" },
  { name: "Garden Parasol Xuna", brand: "The Masie", file: "19.png", url: "https://www.themasie.com/es/comprar-sombrillas-y-parasoles/221129-sombrilla-de-jardin-y-terraza-o260-cm-xuna.html" },
];

(async () => {
  // 1. New + replaced travel guides
  for (const g of GUIDES) {
    const hero = await uploadImage(path.join(TRAVEL_DIR, g.img));
    await c.createOrReplace({
      _id: g.id, _type: "cityGuide",
      city: g.city, country: g.country,
      slug: { _type: "slug", current: slugify(g.city) },
      category: { _type: "reference", _ref: CAT_TRAVEL },
      heroImage: hero, intro: g.intro, gated: false,
      stay: places(g.stay), eat: places(g.eat), do: places(g.do), shop: places(g.shop),
      gallery: [],
    });
    console.log("guide upserted:", g.city, `(stay ${g.stay.length}/eat ${g.eat.length}/do ${g.do.length}/shop ${g.shop.length})`);
  }

  // 2. Delete Lisbon (replaced by Milano)
  await c.delete("cityGuide-lisbon").then(() => console.log("deleted Lisbon guide")).catch((e) => console.log("Lisbon delete:", e.message));

  // 3. Hero-photo swaps on existing guides
  for (const s of HERO_SWAPS) {
    const hero = await uploadImage(path.join(TRAVEL_DIR, s.img));
    await c.patch(s.id).set({ heroImage: hero }).commit();
    console.log("hero swapped:", s.city, "<-", s.img);
  }

  // 4. Add the 3 missing Rattan interior products
  for (const p of INTERIOR) {
    const img = await uploadImage(path.join(INT_DIR, p.file));
    const id = "product-" + slugify(p.brand + "-" + p.name);
    await c.createOrReplace({
      _id: id, _type: "product",
      productName: p.name, brand: p.brand,
      slug: { _type: "slug", current: slugify(p.brand + "-" + p.name) },
      category: { _type: "reference", _ref: CAT_INTERIOR },
      department: "unisex", primaryImage: img,
      sourceUrl: p.url, network: "direct", gridSize: "1x1", active: true,
    });
    console.log("interior product added:", p.brand, p.name);
  }

  console.log("\nDONE.");
})().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });
