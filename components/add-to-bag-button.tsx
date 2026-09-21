"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/types/store";
import { useCart } from "@/components/cart-provider";

export function AddToBagButton({ product }: { product: Product }) {
  const { items, add } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const soldOut = product.stock <= 0;
  const inBag = items.find((item) => item.product.id === product.id)?.quantity ?? 0;
  const remaining = Math.max(product.stock - inBag, 0);
  const atLimit = !soldOut && remaining === 0;
  const disabled = soldOut || atLimit;
  const qty = Math.min(quantity, Math.max(remaining, 1));

  function handleClick() {
    add(product, qty);
    setQuantity(1);
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1600);
  }

  const label = soldOut ? "Sold out" : atLimit ? "Max in bag" : added ? "Added" : "Add to bag";

  return (
    <div className="pcard-actions">
      <div className="pcard-qty" role="group" aria-label={`Quantity for ${product.name}`}>
        <button
          type="button"
          aria-label="Decrease quantity"
          onClick={() => setQuantity(Math.max(qty - 1, 1))}
          disabled={disabled || qty <= 1}
        >
          −
        </button>
        <output aria-live="polite">{qty}</output>
        <button
          type="button"
          aria-label="Increase quantity"
          onClick={() => setQuantity(Math.min(qty + 1, remaining))}
          disabled={disabled || qty >= remaining}
        >
          +
        </button>
      </div>
      <button
        type="button"
        className="pcard-add"
        onClick={handleClick}
        disabled={disabled}
        data-added={added || undefined}
        aria-label={
          soldOut
            ? `${product.name} is sold out`
            : atLimit
              ? `All available stock of ${product.name} is in your bag`
              : `Add ${qty} ${product.name} to bag`
        }
      >
        {label}
      </button>
    </div>
  );
}