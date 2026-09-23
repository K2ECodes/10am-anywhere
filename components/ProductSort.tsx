"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import EditGrid from "./EditGrid";

// Sort control shown above a product grid. "Newest" keeps the incoming order,
// which the queries already return as date-added (newest first); the price
// options re-sort a copy so the original order is preserved for "Newest".
type Sort = "newest" | "price-asc" | "price-desc";

export default function ProductSort({
  products,
  editorial = false,
}: {
  products: Product[];
  editorial?: boolean;
}) {
  const [sort, setSort] = useState<Sort>("newest");

  const sorted = useMemo(() => {
    if (sort === "newest") return products;
    const copy = [...products];
    copy.sort((a, b) => (sort === "price-asc" ? a.price - b.price : b.price - a.price));
    return copy;
  }, [products, sort]);

  return (
    <>
      <div className="sort-bar">
        <label htmlFor="product-sort" className="sort-label">
          Sort
        </label>
        <div className="sort-select-wrap">
          <select
            id="product-sort"
            className="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>
      <EditGrid products={sorted} editorial={editorial} />
    </>
  );
}
