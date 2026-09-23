/* Create the new Fashion products in Sanity. No primaryImage (client adds
   screenshots). Prices/currencies from the retailer pages; collection-page items
   left without a price for manual selection. */
const { createClient } = require("@sanity/client");
const c = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2026-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false, perspective: "published",
});

// price:null => leave empty (collection page / could not confirm exact variant)
const P = [
  { brand: "Ba&sh", name: "Dalena Jacket", price: 206, cur: "EUR", url: "https://ba-sh.com/es/p/chaqueta-dalena-paille-3667436033698.html" },
  { brand: "Ba&sh", name: "Deana Trousers", price: 156, cur: "EUR", url: "https://ba-sh.com/es/p/pantalón-deana-paille-3667436023699.html" },
  { brand: "COS", name: "Scoop-Neck Ribbed Tank Top", price: 340, cur: "NOK", url: "https://cos.com/en-no/women/womenswear/tops/sleeveless/product/scoop-neck-ribbed-tank-top-white-1188243002" },
  { brand: "Globe-Trotter", name: "Golf le Fleur 4-Wheels Carry-On", price: 2545, cur: "EUR", url: "https://globe-trotter.com/products/golf-le-fleur-4-wheels-carry-on-ivory-multi" },
  { brand: "Heretic Parfum", name: "Dirty Coconut", price: 68.95, cur: "EUR", url: "https://hereticparfum.com/products/dirty-coconut" },
  { brand: "AKT London", name: "The Body Conditioning Balm", price: 26, cur: "GBP", url: "https://aktlondon.com/products/the-body-conditioning-balm" },
  { brand: "Celine", name: "Large Hair Claw in Acetate", price: 370, cur: "EUR", url: "https://celine.com/en-be/women/accessories/hair-accessories/celine-large-hair-claw-in-acetate-46Y852T32.32LC.html" },
  { brand: "Alohas", name: "Ola Leather Sandals", price: 150, cur: "EUR", url: "https://alohas.com/products/ola-pale-yellow-leather-sandals" },
  { brand: "Staud", name: "Cruise Bandeau", price: 145, cur: "EUR", url: "https://staud.clothing/products/cruise-bandeau-sunshine" },
  { brand: "Staud", name: "Rove Short", price: 145, cur: "EUR", url: "https://staud.clothing/products/rove-short-sunshine" },
  { brand: "Zimmermann", name: "Roselight Chain-Trim Bikini", price: 295, cur: "EUR", url: "https://zimmermann.com/en-eu/roselight-chain-trim-bikini-mustard.html" },
  { brand: "Maje", name: "Crochet Raffia Bucket Hat", price: 115, cur: "EUR", url: "https://global.maje.com/en-pt/p/crochet-raffia-bucket-hat/MFABO00592_0130.html" },
  { brand: "Gast", name: "Syn Classic Havana Round Sunglasses", price: 119, cur: "EUR", url: "https://gast-shop.com/en/products/syn-classic-havana-round-sunglasses" },
  { brand: "Gas Bijoux", name: "Les Salins XL Raffia Basket Bag", price: 310, cur: "EUR", url: "https://gasbijoux.com/en/products/panier-les-salins-xl-moutarde" },
  { brand: "Staud", name: "Summer Accessories", price: null, cur: "EUR", url: "https://staud.clothing/collections/summer-accessories" },
  { brand: "Paris Texas", name: "Sveva Buckle Ballet Flat", price: null, cur: "EUR", url: "https://paristexasbrand.com/collections/sveva-buckle-ballet-flat" },
  { brand: "Tan-Luxe", name: "The Butter", price: 42, cur: "USD", url: "https://tan-luxe.com/products/the-butter" },
  { brand: "Alémais", name: "Silk Satin Scarf", price: null, cur: "EUR", url: "https://alemais.com/collections/scarves" },
  { brand: "Self-Portrait", name: "Floral Midi Dress", price: null, cur: "EUR", url: "https://us.self-portrait.com/collections/midi-dresses" },
  { brand: "La DoubleJ", name: "Hendrix Pants", price: null, cur: "EUR", url: "https://us.ladoublej.com/en/shop-by/icons/hendrix-pants/" },
  { brand: "Anya Hindmarch", name: "Hermit Crab Crossbody in Raffia", price: null, cur: "EUR", url: "https://us.anyahindmarch.com/products/crossbody-hermit-crab-in-raffia-with-smooth-eco-leather-natural" },
  { brand: "Jennifer Behr", name: "Selkie Earrings", price: 380, cur: "EUR", url: "https://www.jenniferbehr.com/products/selkie-earrings-gold" },
  { brand: "Andrew Sean Greer", name: "Villa Coco", price: null, cur: "EUR", url: "https://www.amazon.es/-/en/Andrew-Sean-Greer-ebook/dp/B0FRLXBHJ6" },
];

const slugify = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90);

(async () => {
  let n = 0;
  for (const p of P) {
    const slug = slugify(p.brand + "-" + p.name);
    const doc = {
      _id: "product-" + slug,
      _type: "product",
      productName: p.name,
      brand: p.brand,
      slug: { _type: "slug", current: slug },
      category: { _type: "reference", _ref: "category-fashion" },
      department: p.brand === "Andrew Sean Greer" ? "unisex" : "women",
      sourceUrl: p.url,
      currency: p.cur,
      network: "direct",
      gridSize: "1x1",
      active: true,
    };
    if (p.price != null) doc.price = p.price;
    await c.createOrReplace(doc);
    n++;
    console.log(`${n}. ${p.brand} — ${p.name} — ${p.price != null ? p.price + " " + p.cur : "(no price)"}`);
  }
  console.log(`\nDONE. Created/updated ${n} fashion products.`);
})().catch((e) => { console.error("FATAL", e.message); process.exit(1); });
