"use client";

import type { Product } from "@/lib/types";
import { useWishlist } from "@/lib/wishlist";
import { trackAddToWishlist } from "@/lib/track";

// The wishlist heart in the product card corner. Optimistic via the provider.
export default function WishlistHeart({ product }: { product: Product }) {
  const { has, toggle } = useWishlist();
  const saved = has(product.slug);
  return (
    <button
      type="button"
      className="ec-wish"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${product.brand} ${product.name} from wishlist` : `Save ${product.brand} ${product.name} to wishlist`}
      onClick={(e) => {
        e.preventDefault();
        // Only count adds, not removals.
        if (!saved) trackAddToWishlist(product);
        toggle(product);
      }}
    >
      {saved ? "♥" : "♡"}
    </button>
  );
}
