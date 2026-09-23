/* Patch affiliateUrl onto each guide place that has an official website. */
const { createClient } = require("@sanity/client");
const c = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2026-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false, perspective: "published",
});

const DATA = {
  paris: [
    {name:"Le Bristol",url:"https://www.oetkercollection.com/destinations/le-bristol-paris/"},
    {name:"Hotel D'aubusson",url:"https://www.hoteldaubusson.com/"},
    {name:"Le Grand Mazarin",url:"https://www.legrandmazarin.com/"},
    {name:"La Fantaisie",url:"https://www.lafantaisie.com/"},
    {name:"So/Paris",url:"https://all.accor.com/hotel/A7L5/index.en.shtml"},
    {name:"Hôtel Madame Rêve",url:"https://madamereve.com/en/"},
    {name:"Bonjour Jacob",url:"https://www.bonjourjacob.com/"},
    {name:"Café de Flore",url:"https://cafedeflore.fr/en/"},
    {name:"Le Rostand",url:null},
    {name:"Télescope",url:null},
    {name:"La Palette",url:"https://lapalette-paris.com/"},
    {name:"Café Hugo",url:null},
    {name:"Le Grand Café",url:"https://www.legrandcafe.com/en/"},
    {name:"Doki Doki",url:"https://dokidoki-handroll.com/en/"},
    {name:"Lafayette's",url:"https://www.lafayettes-restaurant.com/en/home/"},
    {name:"Kinugawa Rive Gauche",url:"https://kinu-gawa.com/"},
    {name:"La Petit Lutetia",url:null},
    {name:"Chez George",url:null},
    {name:"Maxim's",url:"https://www.maxims-de-paris.com/"},
    {name:"Baronne",url:"https://paris-society.com/restaurants/baronne/"},
    {name:"Musée Picasso",url:"https://www.museepicassoparis.fr/en/"},
    {name:"Musée Rodin",url:"https://www.musee-rodin.fr/en"},
    {name:"Bourse de Commerce",url:"https://www.pinaultcollection.com/en/boursedecommerce"},
    {name:"Musée de la Vie Romantique",url:"https://museevieromantique.paris.fr/"},
    {name:"Musée Gustave Moreau",url:"https://musee-moreau.fr/en"},
    {name:"Mam Musée D'art Moderne",url:"https://www.mam.paris.fr/"},
    {name:"Musée Jacquemart André",url:"https://www.musee-jacquemart-andre.com/en"},
    {name:"Heurgon",url:"https://www.heurgon.com/"},
    {name:"Nose Paris",url:"https://noseparis.com/en/"},
    {name:"The Red Wheelbarrow",url:"https://theredwheelbarrowbookstore.com/"},
    {name:"Marin Montagut",url:"https://www.marinmontagut.com/en"},
    {name:"Merci",url:"https://merci-merci.com/en"},
    {name:"Le Bone Marché",url:"https://www.lebonmarche.com/en"},
    {name:"Le Samaritaine",url:"https://www.samaritaine.com/en/"},
  ],
  london: [
    {name:"The Cadogan",url:"https://www.belmond.com/hotels/europe/uk/london/belmond-cadogan-hotel/"},
    {name:"Beaverbrook",url:"https://beaverbrook.co.uk/"},
    {name:"The Connaught",url:"https://www.maybourne.com/en/hotels/the-connaught/"},
    {name:"Broadwick",url:"https://www.broadwicksoho.com/"},
    {name:"Nomad",url:"https://www.thenomadhotel.com/london/"},
    {name:"The Laslett",url:"https://www.living-rooms.co.uk/the-laslett/"},
    {name:"The Ned",url:"https://www.thened.com/london"},
    {name:"The Mayfair Townhouse",url:"https://www.themayfairtownhouse.com/"},
    {name:"The Hoxton",url:"https://thehoxton.com/"},
    {name:"Cinder",url:"https://www.cinderrestaurant.co.uk/"},
    {name:"The Barbary",url:"https://www.thebarbary.co.uk/"},
    {name:"The Clove Club",url:"https://www.thecloveclub.com/"},
    {name:"Bibi",url:"https://www.bibirestaurants.com/"},
    {name:"Serra",url:"https://www.rosewoodhotels.com/en/the-chancery-rosewood/dining/serra"},
    {name:"Carbone",url:"https://carbonelondon.com/"},
    {name:"The Hart",url:"https://www.thehartw1.com/"},
    {name:"The Maine",url:"https://themainemayfair.com/"},
    {name:"Dorian",url:"https://www.dorianrestaurant.com/"},
    {name:"Soma Soho",url:"https://soma.london/"},
    {name:"Arlington",url:"https://www.arlington.london/"},
    {name:"Poon's",url:"https://www.poonslondon.com/"},
    {name:"Pavillion Road",url:null},
    {name:"Pimlico Road",url:null},
    {name:"Kings Road",url:"https://www.kingsroad.co.uk"},
    {name:"Shoreditch",url:null},
    {name:"Columbia Road",url:"http://columbiaroad.info"},
    {name:"Portobello Road",url:null},
    {name:"Mount Street",url:"https://www.mountstreetneighbourhood.com"},
    {name:"New Bond Street",url:"https://www.bondstreet.co.uk"},
    {name:"Carnaby Street",url:"https://www.carnaby.co.uk"},
    {name:"Liberty",url:"https://www.libertylondon.com/"},
    {name:"Kiobird",url:"https://koibird.com/"},
    {name:"Fernando Jorge",url:"https://fernandojorge.co.uk/"},
    {name:"Annie's Ibiza",url:"https://anniesibiza.com/"},
    {name:"Anna + Nina",url:"https://www.anna-nina.nl/"},
    {name:"Jessie Western",url:"https://jessiewestern.com/"},
    {name:"Fortnum & Mason",url:"https://www.fortnumandmason.com/"},
  ],
  milano: [
    {name:"Grand Hotel et de Milan",url:"https://www.grandhoteletdemilan.it/"},
    {name:"Portrait Milano",url:"https://www.lungarnocollection.com/milan/portrait-milano/"},
    {name:"Vico Hotel Milano",url:"https://www.vicomilano.com/"},
    {name:"Nh Collective Milano Citylife",url:"https://www.nh-collection.com/en/hotel/nh-collection-milano-citylife"},
    {name:"Casa Cipriani",url:"https://www.casaciprianimilano.com/"},
    {name:"Senato Hotel Milano",url:"https://www.senatohotelmilano.it/"},
    {name:"Max Brown Missori",url:"https://maxbrownhotels.com/missori-milan/"},
    {name:"Casa Brera",url:"https://www.marriott.com/en-us/hotels/milcb-casa-brera-a-luxury-collection-hotel-milan/overview/"},
    {name:"The Carlton",url:"https://www.baglionihotels.com/collections/baglioni-hotel-carlton-milan/"},
    {name:"Osteria di Brera",url:null},
    {name:"La Latteria San Marco",url:null},
    {name:"Horto",url:"https://hortorestaurant.com/"},
    {name:"Saint Ambroeus Milano",url:"https://www.santambroeus.com/"},
    {name:"Paper Moon Giardino",url:"https://www.papermoonrestaurants.com/paper-moon-giardino.html"},
    {name:"Beef Bar",url:"https://beefbar.com/milano/"},
    {name:"Il Baretto Milano",url:"https://www.ilbarettomilano.it/"},
    {name:"Langosteria",url:"https://www.langosteria.com/"},
    {name:"Rovello",url:"https://ristorante-rovello.it/en/"},
    {name:"Caruso Nuovo Bistrot",url:"https://www.grandhoteletdemilan.it/en/dining/caruso-nuovo-restaurant.html"},
    {name:"Fondazione Prada",url:"https://www.fondazioneprada.org/"},
    {name:"Adi Museum",url:"https://www.adidesignmuseum.org/"},
    {name:"Pinacoteca di Brera",url:"https://pinacotecabrera.org/en/"},
    {name:"Miart",url:"https://www.miart.it/en/"},
    {name:"Anselm Kiefer",url:null},
    {name:"Robert Mapplethrope",url:null},
    {name:"I Macciaioli",url:null},
    {name:"Concept Store 10 Corso Como",url:"https://10corsocomo.com/"},
    {name:"Concept Store Rossana Orlandi",url:"https://www.rossanaorlandi.com/"},
    {name:"The Store",url:"https://thestoremilano.com/en"},
    {name:"Nilufar Gallery",url:"https://nilufar.com/"},
    {name:"Quadrilatero D'oro",url:null},
    {name:"Brera District",url:null},
    {name:"Navigli",url:null},
    {name:"Corso Garibaldi",url:null},
    {name:"Galleria Vittorio Emanuele II",url:null},
  ],
};

const norm = (s) => String(s).toLowerCase().replace(/\s+/g, " ").trim();

(async () => {
  for (const slug of Object.keys(DATA)) {
    const map = new Map(DATA[slug].map((x) => [norm(x.name), x.url]));
    const g = await c.fetch(
      `*[_type=="cityGuide" && slug.current==$slug][0]{_id, stay, eat, "do":do, shop}`,
      { slug }
    );
    if (!g) { console.log(slug, "NOT FOUND"); continue; }
    const patch = {};
    let linked = 0, total = 0, unmatched = [];
    for (const sec of ["stay", "eat", "do", "shop"]) {
      patch[sec] = (g[sec] || []).map((p) => {
        total++;
        const has = map.has(norm(p.name));
        const url = map.get(norm(p.name));
        if (!has) unmatched.push(p.name);
        if (url) { linked++; return { ...p, affiliateUrl: url }; }
        // no website: leave as-is (strip any stale affiliateUrl)
        const { affiliateUrl, ...rest } = p;
        return rest;
      });
    }
    await c.patch(g._id).set(patch).commit();
    console.log(`${slug}: linked ${linked}/${total}` + (unmatched.length ? ` | unmatched names: ${unmatched.join(", ")}` : ""));
  }
  console.log("DONE");
})().catch((e) => { console.error("FATAL", e.message); process.exit(1); });
