"use client";

import { useState } from "react";

type Props = { productId: string; currentUrl?: string; currentPublicId?: string };

export function ImageUploader({ productId, currentUrl, currentPublicId }: Props) {
  const [preview, setPreview] = useState(currentUrl ?? "");
  const [publicId, setPublicId] = useState(currentPublicId ?? "");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function upload(file: File) {
    setBusy(true); setMessage("");
    try {
      const signatureResponse = await fetch("/api/admin/cloudinary/signature", { method: "POST" });
      const signature = await signatureResponse.json();
      if (!signatureResponse.ok) throw new Error(signature.error);
      const data = new FormData();
      data.append("file", file); data.append("api_key", signature.apiKey); data.append("timestamp", String(signature.timestamp)); data.append("folder", signature.folder); data.append("signature", signature.signature);
      const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`, { method: "POST", body: data });
      const uploaded = await cloudinaryResponse.json();
      if (!cloudinaryResponse.ok) throw new Error("Upload failed.");
      const associateResponse = await fetch("/api/admin/products/image", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, imageUrl: uploaded.secure_url, imagePublicId: uploaded.public_id }) });
      if (!associateResponse.ok) throw new Error((await associateResponse.json()).error ?? "Association failed.");
      const previousPublicId = publicId;
      setPreview(uploaded.secure_url); setPublicId(uploaded.public_id);
      if (previousPublicId && previousPublicId !== uploaded.public_id) {
        const cleanupResponse = await fetch("/api/admin/cloudinary/destroy", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ publicId: previousPublicId }) });
        setMessage(cleanupResponse.ok ? "Image replaced and previous asset deleted." : "Image replaced, but the previous asset could not be deleted.");
      } else setMessage("Image associated with product.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to upload image."); } finally { setBusy(false); }
  }
  async function remove() {
    if (!publicId) return;
    setBusy(true); setMessage("");
    try { const response = await fetch("/api/admin/cloudinary/destroy", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ publicId }) }); if (!response.ok) throw new Error("Unable to delete image."); const clearResponse = await fetch("/api/admin/products/image", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, imageUrl: "", imagePublicId: "" }) }); if (!clearResponse.ok) throw new Error("Image deleted, but the product association could not be cleared."); setPreview(""); setPublicId(""); setMessage("Image deleted and product association cleared."); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to delete image."); } finally { setBusy(false); }
  }
  return <div className="image-uploader"><div className="image-preview">{preview ? <img src={preview} alt="Product preview" /> : <span>No product image</span>}</div><label className="button button-dark">{busy ? "Working..." : "Upload image"}<input type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={busy} onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); }} /></label>{publicId && <button className="button image-delete" type="button" disabled={busy} onClick={() => void remove()}>Delete image</button>}<small>{publicId || "No Cloudinary public ID"}</small>{message && <p className="form-error">{message}</p>}</div>;
}
