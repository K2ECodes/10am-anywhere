import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EditGrid from "@/components/EditGrid";
import { getEditBySlug } from "@/lib/content";
import { JsonLd, SITE_URL, breadcrumbs } from "@/lib/seo";

// A published edit on its own page (e.g. /edit/caftans-are-back). Read live so a
// newly published product in the edit shows immediately.
export const dynamic = "force-dynamic";

const clean = (t: string) => t.replace(/\s*\n\s*/g, " ").trim();

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const edit = await getEditBySlug(params.slug);
  if (!edit) return { title: "10am" };
  const title = `${clean(edit.title)} · 10am`;
  const description =
    clean(edit.description) ||
    `${clean(edit.title)}: ${edit.products.length} pieces chosen by the 10am founders, from ${Array.from(new Set(edit.products.map((p) => p.brand.trim()))).slice(0, 4).join(", ")} and more.`;
  const image = edit.mobileCover || edit.collage[0]?.image;
  return {
    title,
    description,
    alternates: { canonical: `/edit/${params.slug}` },
    openGraph: { type: "article", title, description, url: `/edit/${params.slug}`, images: image ? [image] : undefined },
  };
}

export default async function EditPage({ params }: { params: { slug: string } }) {
  const edit = await getEditBySlug(params.slug);
  if (!edit) notFound();

  const cover = edit.collage[0]?.image;
  const url = `${SITE_URL}/edit/${params.slug}`;
  const ld = [
    {
      "@type": "CollectionPage",
      "@id": `${url}#page`,
      url,
      name: clean(edit.title),
      description: clean(edit.description) || undefined,
      image: cover || undefined,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      publisher: { "@id": `${SITE_URL}/#org` },
      mainEntity: {
        "@type": "ItemList",
        name: `${clean(edit.title)}, the 10am edit`,
        numberOfItems: edit.products.length,
        itemListElement: edit.products.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "Product",
            name: `${p.brand.trim()} ${p.name.trim()}`,
            brand: { "@type": "Brand", name: p.brand.trim() },
            image: p.image || undefined,
            category: p.category || undefined,
            offers: p.price
              ? { "@type": "Offer", price: p.price, priceCurrency: p.currency || "EUR", url: p.sourceUrl || p.affiliateUrl || url }
              : undefined,
          },
        })),
      },
    },
    breadcrumbs([{ name: "10am", path: "/" }, { name: clean(edit.title), path: `/edit/${params.slug}` }]),
  ];
  return (
    <>
      <JsonLd data={ld} />
      {cover ? (
        <section className="hero hero-single">
          <figure className="hero-single-img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} alt={clean(edit.title)} />
          </figure>
        </section>
      ) : (
        <div className="cat-orient">{clean(edit.title)}</div>
      )}
      <EditGrid products={edit.products} />
    </>
  );
}
