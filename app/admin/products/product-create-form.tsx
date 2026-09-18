"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/types/store";

type UploadedImage = { url: string; publicId: string };

export function ProductCreateForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function upload(file: File) {
    setBusy(true); setError("");
    try {
      const signatureResponse = await fetch("/api/admin/cloudinary/signature", { method: "POST" });
      const signature = await signatureResponse.json();
      if (!signatureResponse.ok) throw new Error(signature.error);
      const data = new FormData(); data.append("file", file); data.append("api_key", signature.apiKey); data.append("timestamp", String(signature.timestamp)); data.append("folder", signature.folder); data.append("signature", signature.signature);
      const response = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`, { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok) throw new Error("Cloudinary upload failed.");
      setImage({ url: result.secure_url, publicId: result.public_id }); setPreview(result.secure_url);
    } catch (uploadError) { setError(uploadError instanceof Error ? uploadError.message : "Unable to upload image."); } finally { setBusy(false); }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!image) { setError("Upload a Cloudinary image first."); return; }
    setBusy(true); setError(""); const data = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, price: Number(data.price), stock: Number(data.stock), active: data.active === "on", featured: data.featured === "on", image_url: image.url, image_public_id: image.publicId }) });
    if (!response.ok) { setError((await response.json()).error ?? "Unable to create product."); setBusy(false); return; }
    event.currentTarget.reset(); setImage(null); setPreview(""); setBusy(false); router.refresh();
  }
  return <form className="admin-create-form" onSubmit={submit}><h2>New product</h2><label>Name<input name="name" required placeholder="Cloud Veil Moisturizer" /></label><label>Description<textarea name="description" rows={3} required /></label><label>Category<select name="category_id" required defaultValue=""><option value="" disabled>Choose a collection</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label><div className="form-row"><label>Price<input name="price" type="number" min="0" required /></label><label>Stock<input name="stock" type="number" min="0" required /></label></div><label>Currency<input name="currency" defaultValue="DZD" required /></label><label className="check-label"><input name="active" type="checkbox" defaultChecked /> Active</label><label className="check-label"><input name="featured" type="checkbox" /> Featured</label><label className="button button-dark">{busy ? "Uploading..." : "Upload product image"}<input type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={busy} onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); }} /></label>{preview && <div className="image-preview create-preview"><img src={preview} alt="New product preview" /></div>}{image && <small>{image.publicId}</small>}{error && <p className="form-error">{error}</p>}<button className="button button-dark" type="submit" disabled={busy || !image}>{busy ? "Saving..." : "Create product"}</button></form>;
}
