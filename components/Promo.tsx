import type { Product } from "@/lib/types";

// Discount code on a product (Studio: product > Discount code). The line sits
// right above the price; the sticker sits in the image's top-left corner. Both
// read the code and percent from the product, so any future code just works.

export function PromoLine({ promo }: { promo: NonNullable<Product["promo"]> }) {
  return (
    <div className="ec-promo">
      Use code <span className="ec-promo-code">{promo.code}</span>
      {promo.percent ? ` for ${promo.percent}% off` : ""}
    </div>
  );
}

export function PromoSticker({ promo }: { promo: NonNullable<Product["promo"]> }) {
  if (!promo.sticker) return null;
  return (
    <span className="promo-sticker" aria-hidden="true">
      <span className="promo-sticker-ring">
        {promo.percent ? <span className="promo-sticker-off">{promo.percent}% OFF</span> : null}
        <span className="promo-sticker-with">
          With your
          <br />
          exclusive code
        </span>
        <span className="promo-sticker-code">{promo.code}</span>
      </span>
    </span>
  );
}
