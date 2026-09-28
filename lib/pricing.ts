// Save as: lib/pricing.ts
// Single source of truth for sale prices. Every place that shows or charges a product's
// price (card, product page, cart, checkout, and the server-side order route) must go
// through finalPrice() so they can never disagree.
import type { Product } from "@/types/store";

type Priced = Pick<Product, "price" | "discount_percent">;

/** Whole-number percent off, clamped to 0–99. Missing/invalid values mean "no discount". */
export function discountPercent(product: Pick<Product, "discount_percent">): number {
  const pct = Math.round(Number(product.discount_percent) || 0);
  return Math.min(Math.max(pct, 0), 99);
}

export function hasDiscount(product: Pick<Product, "discount_percent">): boolean {
  return discountPercent(product) > 0;
}

/** The price the customer actually pays for one unit. */
export function finalPrice(product: Priced): number {
  const pct = discountPercent(product);
  if (pct === 0) return product.price;
  return Math.round((product.price * (100 - pct)) / 100);
}
