"use client";

import { useWishlist } from "@/lib/wishlist";
import { formatPrice } from "@/lib/format";

export default function WishlistPage() {
  const { items, toggle } = useWishlist();

  return (
    <section className="edit-band" style={{ paddingTop: 64 }}>
      <div style={{ padding: "0 56px 28px" }}>
        <div className="men-kicker">your edit</div>
        <h1 className="men-title" style={{ marginBottom: 8 }}>
          Wishlist
        </h1>
      </div>

      {items.length === 0 ? (
        <p className="section-dek" style={{ textAlign: "left", padding: "0 56px" }}>
          Nothing saved yet. Start your edit, the heart on any piece keeps it here.
        </p>
      ) : (
        <div className="edit-grid">
          {items.map((it) => (
            <article className={`ec${it.image ? "" : " ec-ph"}`} key={it.slug}>
              <button
                type="button"
                className="ec-wish"
                aria-label={`Remove ${it.brand} ${it.name}`}
                aria-pressed="true"
                onClick={() =>
                  toggle({
                    slug: it.slug,
                    brand: it.brand,
                    name: it.name,
                    price: it.price,
                    currency: it.currency,
                    image: it.image,
                    department: "women",
                    affiliateUrl: "#",
                    network: "skimlinks",
                    gridSize: "1x1",
                    active: true,
                  })
                }
              >
                ♥
              </button>
              <a className="ec-card-link" href={`/go/${it.slug}`}>
                <div className="ec-img">
                  {it.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.image} alt={`${it.brand} ${it.name}`} loading="lazy" />
                  ) : (
                    <span className="ec-ph-mark">
                      10am<small>saved</small>
                    </span>
                  )}
                </div>
                <div className="ec-meta">
                  <div className="ec-brand">{it.brand}</div>
                  <div className="ec-name">{it.name}</div>
                  <div className="ec-price">{formatPrice(it.price, it.currency)}</div>
                </div>
              </a>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
