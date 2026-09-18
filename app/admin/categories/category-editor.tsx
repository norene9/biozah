"use client";

import { useState } from "react";
import type { Category } from "@/types/store";

export function CategoryEditor({ category }: { category: Category }) {
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description);
  const [imageUrl, setImageUrl] = useState(category.image_url);
  const [active, setActive] = useState(category.active);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function save() { setBusy(true); setMessage(""); const response = await fetch("/api/admin/categories", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ categoryId: category.id, name, description, image_url: imageUrl, active }) }); setMessage(response.ok ? "Saved." : (await response.json()).error ?? "Unable to save."); setBusy(false); }
  return <div className="category-editor"><label>Name<input value={name} onChange={(event) => setName(event.target.value)} /></label><label>Description<textarea rows={2} value={description} onChange={(event) => setDescription(event.target.value)} /></label><label>Image URL<input type="url" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} /></label><label className="check-label"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} /> Active</label><button className="button button-dark" type="button" disabled={busy} onClick={() => void save()}>{busy ? "Saving..." : "Save collection"}</button>{message && <small>{message}</small>}</div>;
}