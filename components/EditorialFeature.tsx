import Link from "next/link";
import type { EditorialFeature as EditorialFeatureData } from "@/lib/types";

// The second-edit editorial feature (Iconic vintage finds). titleHtml/body are
// trusted internal copy from the content layer.
export default function EditorialFeature({ data }: { data: EditorialFeatureData }) {
  return (
    <section className="editorial-feature">
      <div className="editorial-feature-inner">
        <figure className="editorial-feature-image">
          <span className="ef-tag">{data.tag}</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.image} alt="Iconic vintage finds editorial cover" />
        </figure>
        <div className="editorial-feature-text">
          <div className="story-kicker">{data.kicker}</div>
          <h2 className="story-title" dangerouslySetInnerHTML={{ __html: data.titleHtml }} />
          <p className="story-dek">{data.dek}</p>
          <div className="editorial-feature-meta">
            {data.meta.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
          <div className="editorial-feature-body">
            {data.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <Link className="story-cta" href={`/article/${data.slug}`}>
            {data.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
