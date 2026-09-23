"use client";

import { useEffect, useRef } from "react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { trackAffiliateClick, trackViewContent } from "@/lib/track";
import WishlistHeart from "./WishlistHeart";

// One product. Clicking the card hits /go/[slug] (affiliate redirect + click log).
// The wishlist heart is a sibling, not nested in the link, so it stays valid HTML.
// gridSize lets an editor make an occasional larger "feature" tile (e.g. a 2x2
// spanning where four small tiles would be), per the magazine layout.
const SIZE_CLASS: Record<string, string> = { "2x2": "ec-feat", "2x1": "ec-wide", "1x2": "ec-tall" };

// `size` (from the editorial grid) overrides the product's own gridSize, so the
// category pages can create an automatic magazine rhythm.
export default function ProductCard({ product, size }: { product: Product; size?: string }) {
  const hasImage = Boolean(product.image);
  const sizeClass = SIZE_CLASS[size ?? product.gridSize ?? "1x1"] ?? "";
  const ref = useRef<HTMLElement | null>(null);

  // ViewContent on a *meaningful* impression: the card must be at least half in
  // view for ~600ms (so fast scrolling past it doesn't count), fired once.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    let fired = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const obs = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e.isIntersecting && !fired) {
          timer = setTimeout(() => {
            fired = true;
            trackViewContent(product);
            obs.disconnect();
          }, 600);
        } else if (timer) {
          clearTimeout(timer);
          timer = undefined;
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => {
      if (timer) clearTimeout(timer);
      obs.disconnect();
    };
  }, [product]);

  return (
    <article ref={ref} className={`ec${sizeClass ? " " + sizeClass : ""}${hasImage ? "" : " ec-ph"}`}>
      <WishlistHeart product={product} />
      <a
        className="ec-card-link"
        href={`/go/${product.slug}`}
        target="_blank"
        rel="noopener noreferrer nofollow sponsored"
        aria-label={`${product.brand} ${product.name}`}
        onClick={() => trackAffiliateClick(product)}
      >
        <div className="ec-img">
          {product.webExclusive ? <span className="ec-tag">web exclusive</span> : null}
          {hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image} alt={`${product.brand} ${product.name}`} loading="lazy" />
          ) : (
            <span className="ec-ph-mark">10am</span>
          )}
        </div>
        <div className="ec-meta">
          <div className="ec-brand">{product.brand}</div>
          <div className="ec-name">{product.name}</div>
          <div className="ec-price">{formatPrice(product.price, product.currency)}</div>
        </div>
      </a>
    </article>
  );
}
