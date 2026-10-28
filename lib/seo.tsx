// AEO / SEO helpers: one site URL, the brand entity, and a JSON-LD renderer.
// Structured data is what ChatGPT, Perplexity, Google AI Overviews and Gemini
// read to understand who 10am is and what a page is about, so every content
// type emits it (see app/layout, edit, article, guide pages).
export const SITE_URL = "https://10amanywhere.com";
export const SITE_NAME = "10am anywhere";
export const SITE_DESCRIPTION =
  "A Berlin-based editorial magazine with weekly curated edits of fashion, interior, beauty, culture and travel, chosen by three founders who shop the way they live.";
export const INSTAGRAM = "https://www.instagram.com/10am_anywhere/";

export const ORG = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#org`,
  name: SITE_NAME,
  alternateName: "10am",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.png`,
  email: "info@10amanywhere.com",
  sameAs: [INSTAGRAM],
  address: { "@type": "PostalAddress", addressLocality: "Berlin", addressCountry: "DE" },
  founder: [
    { "@type": "Person", name: "Silke Rumpelhardt" },
    { "@type": "Person", name: "Alexandra Cukierman" },
    { "@type": "Person", name: "Corinna Möll" },
  ],
} as const;

export const abs = (path: string) => (path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`);

export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.path) })),
  };
}

// Renders one or more schema.org nodes as a single JSON-LD graph. "<" is escaped
// so editor-written text can never close the script tag.
export function JsonLd({ data }: { data: object | object[] }) {
  const graph = { "@context": "https://schema.org", "@graph": Array.isArray(data) ? data : [data] };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }}
    />
  );
}
