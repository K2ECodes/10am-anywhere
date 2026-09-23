import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EditGrid from "@/components/EditGrid";
import { getEditBySlug } from "@/lib/content";

// A published edit on its own page (e.g. /edit/caftans-are-back). Read live so a
// newly published product in the edit shows immediately.
export const dynamic = "force-dynamic";

const clean = (t: string) => t.replace(/\s*\n\s*/g, " ").trim();

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const edit = await getEditBySlug(params.slug);
  return { title: edit ? `${clean(edit.title)} · 10am` : "10am" };
}

export default async function EditPage({ params }: { params: { slug: string } }) {
  const edit = await getEditBySlug(params.slug);
  if (!edit) notFound();

  const cover = edit.collage[0]?.image;
  return (
    <>
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
