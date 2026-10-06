import Link from "next/link";
import type { HomepageData } from "@/lib/types";
import ProductCard from "./ProductCard";

// The homepage feature edit (Men or Beauty, changed about monthly): a script
// headline with an optional image beside it, then two rows of four products.
export default function FeatureEdit({ data }: { data: HomepageData["feature"] }) {
  if (!data.products.length) return null;
  return (
    <section className="feature-edit" id="feature-edit" aria-label={data.title}>
      <div className={`feature-head${data.image ? " has-image" : ""}`}>
        <div className="feature-head-text">
          <h2 className="home-script">{data.title}</h2>
          <Link href={data.href} className="home-more">
            {data.linkLabel}
          </Link>
        </div>
        {data.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="feature-img" src={data.image} alt="" loading="lazy" />
        ) : null}
      </div>
      <div className="edit-grid">
        {data.products.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </section>
  );
}
