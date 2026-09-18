"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function CategoryForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/admin/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (!response.ok) { setError((await response.json()).error ?? "Unable to create category."); setBusy(false); return; }
    event.currentTarget.reset(); setBusy(false); router.refresh();
  }
  return <form className="admin-create-form" onSubmit={submit}><h2>New collection</h2><label>Name<input name="name" required placeholder="Skincare" /></label><label>Description<textarea name="description" rows={2} placeholder="A short description" /></label><label>Image URL<input name="image_url" type="url" placeholder="Optional category image URL" /></label>{error && <p className="form-error">{error}</p>}<button className="button button-dark" disabled={busy}>{busy ? "Creating..." : "Create collection"}</button></form>;
}
