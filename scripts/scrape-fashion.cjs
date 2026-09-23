/* Scrape brand / product name / price from each product URL via JSON-LD + OG. */
const ITEMS = [
  { url: "https://ba-sh.com/es/p/chaqueta-dalena-paille-3667436033698.html", brand: "Ba&sh", name: "Dalena Jacket" },
  { url: "https://ba-sh.com/es/p/pantal%C3%B3n-deana-paille-3667436023699.html", brand: "Ba&sh", name: "Deana Trousers" },
  { url: "https://cos.com/en-no/women/womenswear/tops/sleeveless/product/scoop-neck-ribbed-tank-top-white-1188243002", brand: "COS", name: "Scoop-Neck Ribbed Tank Top" },
  { url: "https://globe-trotter.com/products/golf-le-fleur-4-wheels-carry-on-ivory-multi", brand: "Globe-Trotter", name: "Golf le Fleur 4-Wheels Carry-On" },
  { url: "https://hereticparfum.com/products/dirty-coconut", brand: "Heretic Parfum", name: "Dirty Coconut" },
  { url: "https://aktlondon.com/products/the-body-conditioning-balm", brand: "AKT London", name: "The Body Conditioning Balm" },
  { url: "https://celine.com/en-be/women/accessories/hair-accessories/celine-large-hair-claw-in-acetate-46Y852T32.32LC.html", brand: "Celine", name: "Large Hair Claw in Acetate" },
  { url: "https://alohas.com/products/ola-pale-yellow-leather-sandals", brand: "Alohas", name: "Ola Leather Sandals" },
  { url: "https://staud.clothing/products/cruise-bandeau-sunshine", brand: "Staud", name: "Cruise Bandeau" },
  { url: "https://staud.clothing/products/rove-short-sunshine", brand: "Staud", name: "Rove Short" },
  { url: "https://zimmermann.com/en-eu/roselight-chain-trim-bikini-mustard.html", brand: "Zimmermann", name: "Roselight Chain-Trim Bikini" },
  { url: "https://global.maje.com/en-pt/p/crochet-raffia-bucket-hat/MFABO00592_0130.html", brand: "Maje", name: "Crochet Raffia Bucket Hat" },
  { url: "https://gast-shop.com/en/products/syn-classic-havana-round-sunglasses", brand: "Gast", name: "Syn Classic Havana Round Sunglasses" },
  { url: "https://gasbijoux.com/en/products/panier-les-salins-xl-moutarde", brand: "Gas Bijoux", name: "Panier Les Salins XL" },
  { url: "https://staud.clothing/collections/summer-accessories", brand: "Staud", name: "Summer Accessories" },
  { url: "https://paristexasbrand.com/collections/sveva-buckle-ballet-flat", brand: "Paris Texas", name: "Sveva Buckle Ballet Flat" },
  { url: "https://tan-luxe.com/products/the-butter", brand: "Tan-Luxe", name: "The Butter" },
  { url: "https://alemais.com/collections/scarves", brand: "Alémais", name: "Silk Satin Scarf" },
  { url: "https://us.self-portrait.com/collections/midi-dresses", brand: "Self-Portrait", name: "Floral Midi Dress" },
  { url: "https://us.ladoublej.com/en/shop-by/icons/hendrix-pants/", brand: "La DoubleJ", name: "Hendrix Pants" },
  { url: "https://us.anyahindmarch.com/products/crossbody-hermit-crab-in-raffia-with-smooth-eco-leather-natural", brand: "Anya Hindmarch", name: "Hermit Crab Crossbody in Raffia" },
  { url: "https://www.jenniferbehr.com/products/selkie-earrings-gold", brand: "Jennifer Behr", name: "Selkie Earrings" },
  { url: "https://www.amazon.es/-/en/Andrew-Sean-Greer-ebook/dp/B0FRLXBHJ6", brand: "Andrew Sean Greer", name: "" },
];

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36";

function deepFindProduct(node, out) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) { node.forEach((n) => deepFindProduct(n, out)); return; }
  const t = node["@type"];
  const isProduct = t === "Product" || (Array.isArray(t) && t.includes("Product"));
  if (isProduct) {
    if (!out.name && node.name) out.name = node.name;
    if (!out.brand) out.brand = typeof node.brand === "string" ? node.brand : node.brand && node.brand.name;
    let offers = node.offers;
    if (Array.isArray(offers)) offers = offers[0];
    if (offers) {
      if (!out.price && (offers.price || offers.lowPrice)) out.price = offers.price || offers.lowPrice;
      if (!out.currency && offers.priceCurrency) out.currency = offers.priceCurrency;
    }
  }
  for (const k of Object.keys(node)) deepFindProduct(node[k], out);
}

function metaFromHtml(html) {
  const out = {};
  const lds = [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)];
  for (const m of lds) {
    try { deepFindProduct(JSON.parse(m[1].trim()), out); } catch {}
  }
  const og = (p) => {
    const r = new RegExp(`<meta[^>]+(?:property|name)=["']${p}["'][^>]+content=["']([^"']+)["']`, "i").exec(html)
      || new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${p}["']`, "i").exec(html);
    return r && r[1];
  };
  if (!out.name) out.name = og("og:title");
  if (!out.price) out.price = og("product:price:amount") || og("og:price:amount");
  if (!out.currency) out.currency = og("product:price:currency") || og("og:price:currency");
  return out;
}

(async () => {
  const results = [];
  for (const it of ITEMS) {
    let scraped = {};
    let status = "";
    try {
      const res = await fetch(it.url, { headers: { "User-Agent": UA, "Accept-Language": "en" }, redirect: "follow" });
      status = res.status;
      if (res.ok) { scraped = metaFromHtml(await res.text()); }
    } catch (e) { status = "ERR " + e.message; }
    const row = {
      url: it.url,
      brand: scraped.brand || it.brand,
      name: (scraped.name && scraped.name.length < 90 ? scraped.name : null) || it.name,
      price: scraped.price ? Number(String(scraped.price).replace(/[^0-9.]/g, "")) || null : null,
      currency: scraped.currency || null,
      status,
    };
    results.push(row);
    console.log(`[${status}] ${row.brand} | ${row.name} | ${row.price ?? "?"} ${row.currency ?? ""}`);
  }
  require("fs").writeFileSync("/tmp/fashion.json", JSON.stringify(results, null, 2));
  console.log("\nwrote /tmp/fashion.json");
})();
