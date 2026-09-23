import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { GuidePlace } from "@/lib/types";
import PhotoGrid from "@/components/PhotoGrid";
import NewsletterGate from "@/components/NewsletterGate";
import { isSubscribed } from "@/lib/newsletter-gate";
import { getCityGuideBySlug } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const g = await getCityGuideBySlug(params.slug);
  return { title: g ? `10am in ${g.city} · 10am` : "10am" };
}

function Column({ title, places }: { title: string; places: GuidePlace[] }) {
  return (
    <div className="guide-col">
      <h3>{title}</h3>
      {places.map((p) => (
        <div className="guide-place" key={p.name}>
          {p.affiliateUrl ? (
            <a
              className="gp-name gp-link"
              href={p.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
            >
              {p.name}
            </a>
          ) : (
            <div className="gp-name">{p.name}</div>
          )}
          <div className="gp-blurb">{p.blurb}</div>
        </div>
      ))}
    </div>
  );
}

export default async function CityGuidePage({ params }: { params: { slug: string } }) {
  const guide = await getCityGuideBySlug(params.slug);
  if (!guide) notFound();

  // City guides are Travel content: members-only until the reader subscribes.
  if (!isSubscribed()) {
    return <NewsletterGate section="Travel" />;
  }

  return (
    <>
      <header className="page-head guide-head">
        <div className="page-kicker">
          A 10am city guide
          {guide.gated ? <span className="gated-flag">Members</span> : null}
        </div>
        <h1 className="page-title">
          10am in
          <br />
          {guide.city}.
        </h1>
        <div style={{ maxWidth: 620 }}>
          {guide.intro.map((p, i) => (
            <p className="page-dek" key={i} style={{ marginBottom: 5 }}>
              {p}
            </p>
          ))}
        </div>
      </header>

      <figure className="article-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={guide.heroImage} alt={`${guide.city}, ${guide.country}`} />
      </figure>

      <section className="guide-grid">
        <Column title="Stay" places={guide.stay} />
        <Column title="Eat" places={guide.eat} />
        <Column title="Do" places={guide.do} />
        <Column title="Shop" places={guide.shop} />
      </section>

      <PhotoGrid photos={guide.gallery} label={`${guide.city}, in pictures`} />
    </>
  );
}
