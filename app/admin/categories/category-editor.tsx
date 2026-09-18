"use client";

import { useState } from "react";
import type { Category } from "@/types/store";
import { ImageUploadField } from "@/app/admin/products/image-upload-field";

export function CategoryEditor({ category }: { category: Category }) {
  const [form, setForm] = useState({
    name: category.name,
    description: category.description,
    image_url: category.image_url,
    image_public_id: category.image_public_id ?? "",
    active: category.active,
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const set = (key: string, value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value }));
  async function save() {
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/admin/categories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId: category.id, ...form }),
    });
    setMessage(response.ok ? "Saved." : ((await response.json()).error ?? "Unable to save."));
    setBusy(false);
  }
  return (
    <div className="category-editor">
      <ImageUploadField
        folder="biozah/categories"
        url={form.image_url}
        publicId={form.image_public_id}
        onChange={(url, publicId) => {
          set("image_url", url);
          set("image_public_id", publicId);
        }}
      />
      <label>
        Name
        <input value={form.name} onChange={(event) => set("name", event.target.value)} />
      </label>
      <label>
        Description
        <textarea
          rows={2}
          value={form.description}
          onChange={(event) => set("description", event.target.value)}
        />
      </label>
      <label className="check-label">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(event) => set("active", event.target.checked)}
        />{" "}
        Active
      </label>
      <button
          className="button button-dark category-save-button"
        type="button"
        disabled={busy}
        onClick={() => void save()}
      >
        {busy ? "Saving..." : "Save collection"}
      </button>
      {message && <small>{message}</small>}
    </div>
  );
}
