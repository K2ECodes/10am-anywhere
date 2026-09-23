const SYMBOLS: Record<string, string> = { EUR: "€", USD: "$", GBP: "£" };

// Matches the prototype: "€ 250". Null-safe: a product still missing its price
// (e.g. just added via the paste-link flow) renders with no price text instead
// of throwing and crashing the whole category page during server render.
export function formatPrice(price?: number | null, currency?: string | null): string {
  if (price == null || Number.isNaN(price)) return "";
  const cur = currency || "EUR";
  const symbol = SYMBOLS[cur] ?? cur + " ";
  return `${symbol} ${price.toLocaleString("en-GB")}`;
}
