import Link from "next/link";
import type { EditorialRef } from "@/lib/types";

// "What's On?": a two-story teaser for the culture (and travel) notes, linking
// each story directly plus the full "What's on now" list on the Culture page.
export default function WhatsOn({ title, items }: { title: string; items: EditorialRef[] }) {
  if (!items.length) return null;
  return (
    <section className="whatson" aria-label={title}>
      <div className="whatson-head">
        <h2 className="home-script">{title}</h2>
        <Link href="/category/culture#whats-on" className="home-more">
          See what&rsquo;s on now
        </Link>
      </div>
      <div className="whatson-grid">
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
