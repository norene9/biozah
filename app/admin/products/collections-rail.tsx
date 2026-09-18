"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Category, Product } from "@/types/store";

export function CollectionsRail({ categories, products, selected }: { categories: Category[]; products: Product[]; selected: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  async function create() { if (!name.trim()) return; setBusy(true); const response = await fetch("/api/admin/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim() }) }); if (response.ok) { setName(""); router.refresh(); } setBusy(false); }
  const count = (id: string) => products.filter((product) => product.category_id === id).length;
  return <aside className="collections-rail"><div className="rail-heading"><p className="eyebrow">Catalogue</p><h2>Collections</h2></div><div className="quick-collection"><input value={name} onChange={(event) => setName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void create(); }} placeholder="New collection" aria-label="New collection name" /><button type="button" disabled={busy || !name.trim()} onClick={() => void create()} aria-label="Create collection">+</button></div><button className={selected === "all" ? "collection-link active" : "collection-link"} type="button" onClick={() => router.push("/admin/products")}>All products <span>{products.length}</span></button>{categories.map((category) => <button className={selected === category.slug ? "collection-link active" : "collection-link"} type="button" key={category.id} onClick={() => router.push(`/admin/products?collection=${category.slug}`)}>{category.name}<span>{count(category.id)}{!category.active && " · Off"}</span></button>)}</aside>;
}
