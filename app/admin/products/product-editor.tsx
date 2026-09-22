"use client";

import { useState } from "react";
import type { Product } from "@/types/store";

export function ProductEditor({ product }: { product: Product }) {
  const [price, setPrice] = useState(String(product.price));
  const [stock, setStock] = useState(String(product.stock));
  const [active, setActive] = useState(product.active);
  const [featured, setFeatured] = useState(product.featured);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function save() {
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product.id,
        price: Number(price),
        stock: Number(stock),
        active,
        featured,
      }),
    });
    setMessage(response.ok ? "Saved." : ((await response.json()).error ?? "Unable to save."));
    setBusy(false);
  }
  return (
    <div className="product-editor">
      <label>
        Price
        <input
          type="number"
          min="0"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
        />
      </label>
      <label>
        Stock
        <input
          type="number"
          min="0"
          value={stock}
          onChange={(event) => setStock(event.target.value)}
        />
      </label>
      <label className="check-label">
        <input
          type="checkbox"
          checked={active}
          onChange={(event) => setActive(event.target.checked)}
        />{" "}
        Active
      </label>
      <label className="check-label">
        <input
          type="checkbox"
          checked={featured}
          onChange={(event) => setFeatured(event.target.checked)}
        />{" "}
        Featured
      </label>
      <button
        className="button button-dark"
        type="button"
        disabled={busy}
        onClick={() => void save()}
      >
        {busy ? "Saving..." : "Save product"}
      </button>
      {message && <small>{message}</small>}
    </div>
  );
}
