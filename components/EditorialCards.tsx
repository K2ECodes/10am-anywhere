import Link from "next/link";
import type { EditorialRef } from "@/lib/types";

// Editorials that belong to a section (e.g. "10am in Lisbon" under Travel).
// `highlight` gives the band a distinct background + headline so it doesn't get
// overlooked. `feature` makes it the lead of the page: two large cards a row
// (used on Culture, where the columns sit above the books and podcasts).
export default function EditorialCards({
  items,
  label = "Editorials",
  highlight = false,
  feature = false,
}: {
  items: EditorialRef[];
  label?: string;
  highlight?: boolean;
  feature?: boolean;
}) {
  if (!items.length) return null;
  return (
    <section className={`ed-band${highlight ? " ed-band-highlight" : ""}${feature ? " ed-band-feature" : ""}`} id={highlight ? "whats-on" : undefined}>
      <div className="ed-head">
        {highlight ? (
          <h2 className="ed-headline">{label}</h2>
        ) : (
          <div className="page-kicker">{label}</div>
        )}
      </div>
      <div className="ed-grid">
        {items.map((e) => (
          <Link
            key={e.kind + e.slug}
            href={`/${e.kind === "article" ? "article" : "guide"}/${e.slug}`}
            className="ed-card"
          >
            <div className={`ed-card-img${e.image ? "" : " ed-card-img-text"}`}>
              {e.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={e.image} alt={e.title} loading="lazy" />
              ) : (
                <span className="ed-card-wordmark">{e.title}</span>
              )}
            </div>
            <div className="ed-card-kicker">{e.kicker}</div>
            <div className="ed-card-title">{e.title}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
