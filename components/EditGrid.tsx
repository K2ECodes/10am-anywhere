import type { Product } from "@/lib/types";
import ProductCard from "./ProductCard";

// Automatic magazine rhythm for the shop pages: occasionally a product is shown
// as a larger 2x2 "feature" tile, so it feels editorial rather than mechanical.
// An editor's explicit gridSize on a product still wins. The cadence leaves TWO
// full "normal" rows (8 tiles on desktop) between each feature band: two normal
// rows + one feature band (the feature + 4 tiles beside it) = a 13-item block,
// so features land every 13th position. row-dense flow closes the gaps.
const FEATURE_OFFSETS = [8, 21];
const CYCLE = 26;

function editorialSize(product: Product, index: number): string {
  if (product.gridSize && product.gridSize !== "1x1") return product.gridSize;
  return FEATURE_OFFSETS.includes(index % CYCLE) ? "2x2" : "1x1";
}

export default function EditGrid({
  products,
  editorial = false,
}: {
  products: Product[];
  editorial?: boolean;
}) {
  return (
    <section className="edit-band">
      <div className={`edit-grid${editorial ? " editorial-grid" : ""}`}>
        {products.map((p, i) => (
          <ProductCard
            key={p.slug}
            product={p}
            size={editorial ? editorialSize(p, i) : undefined}
          />
        ))}
      </div>
    </section>
  );
}
