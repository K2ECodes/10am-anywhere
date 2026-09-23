import type { Metadata } from "next";
import ProductSort from "@/components/ProductSort";
import { getMenEdit } from "@/lib/content";

export const metadata: Metadata = { title: "Men · 10am" };

// Render on every request so a newly published men's product appears immediately.
export const dynamic = "force-dynamic";

export default async function MenPage() {
  const men = await getMenEdit();
  return (
    <div className="shop-page">
      {/* Same orientation-label headline as the other category pages (e.g. Interior). */}
      <div className="cat-orient">{men.kicker}</div>
      <ProductSort products={men.products} editorial />
    </div>
  );
}
