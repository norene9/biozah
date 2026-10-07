"use client";
import type { Product } from "@/types/store";
import { useCart } from "./cart-provider";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
export function AddToCart({ product, dict }: { product: Product; dict: Dictionary["product"] }) {
  const { add } = useCart();
  return (
    <button className="button button-dark" disabled={!product.stock} onClick={() => add(product)}>
      {product.stock ? dict.addToBag : dict.currentlyUnavailable}
    </button>
  );
}
