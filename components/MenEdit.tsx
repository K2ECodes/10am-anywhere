import type { MenEdit as MenEditData } from "@/lib/types";
import ProductCard from "./ProductCard";

// The Men section (Option A: dedicated "for him" edit band under the women's
// edit, with a Women | Men department toggle). Final treatment to be confirmed
// against Silke's examples; this is the recommended reading.
export default function MenEdit({ data }: { data: MenEditData }) {
  return (
    <section className="men-edit" id="men-edit">
      <div className="men-head">
        <div className="men-head-titles">
          <h2 className="men-title">Men</h2>
        </div>
      </div>

      <div className="edit-grid">
        {data.products.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </section>
  );
}
