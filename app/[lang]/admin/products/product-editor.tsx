"use client";

import { useState } from "react";
import type { Category, Product } from "@/types/store";
import { finalPrice } from "@/lib/pricing";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type UploadedImage = { url: string; publicId: string };

export function ProductEditor({
  product,
  categories,
  onClose,
  onSaved,
  dict,
}: {
  product: Product;
  categories: Category[];
  onClose: () => void;
  onSaved: (updated: Product) => void;
  dict: Dictionary["forms"];
}) {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description ?? "");
  const [categoryId, setCategoryId] = useState(product.category_id);
  const [price, setPrice] = useState(String(product.price));
  const [discount, setDiscount] = useState(String(product.discount_percent ?? 0));
  const [stock, setStock] = useState(String(product.stock));
  const [active, setActive] = useState(product.active);
  const [featured, setFeatured] = useState(product.featured);
  const [image, setImage] = useState<UploadedImage>({
    url: product.image_url ?? "",
    publicId: product.image_public_id ?? "",
  });
  const [preview, setPreview] = useState(product.image_url ?? "");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function uploadImage(file: File) {
    setUploading(true);
    setMessage("");
    try {
      const signatureResponse = await fetch("/api/admin/cloudinary/signature", { method: "POST" });
      const signature = await signatureResponse.json();
      if (!signatureResponse.ok) throw new Error(signature.error);

      const data = new FormData();
      data.append("file", file);
      data.append("api_key", signature.apiKey);
      data.append("timestamp", String(signature.timestamp));
      data.append("folder", signature.folder);
      data.append("signature", signature.signature);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
        {
          method: "POST",
          body: data,
        },
      );
      const result = await response.json();
      if (!response.ok) throw new Error("Cloudinary upload failed.");

      setImage({ url: result.secure_url, publicId: result.public_id });
      setPreview(result.secure_url);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to upload image.");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setBusy(true);
    setMessage("");
    const updates = {
      name,
      description,
      category_id: categoryId,
      price: Number(price),
      discount_percent: Math.min(Math.max(Math.round(Number(discount) || 0), 0), 99),
      stock: Number(stock),
      active,
      featured,
      image_url: image.url,
      image_public_id: image.publicId,
    };
    const response = await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, ...updates }),
    });
    if (response.ok) {
      onSaved({ ...product, ...updates }); // hand the merged result straight back — no re-fetch needed to see it
    } else {
      setMessage((await response.json().catch(() => null))?.error ?? "Unable to save.");
      setBusy(false);
    }
  }

  return (
    <div className="product-editor product-editor--inline">
      <div className="product-editor-image">
        <div className="product-image-preview product-image-preview--sm">
          {preview ? (
            <img src={preview} alt="" />
          ) : (
            <div className="product-image-placeholder">
              <span>{dict.noImage}</span>
            </div>
          )}
        </div>
        <label className="button sheet-reset upload-image-button upload-image-button--sm">
          {uploading ? dict.uploading : dict.changeImage}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            disabled={uploading || busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void uploadImage(file);
            }}
          />
        </label>
      </div>

      <div className="product-editor-fields">
        <label>
          {dict.name}
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>

        <label>
          {dict.description}
          <textarea
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>

        <label>
          {dict.collection}
          <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
            {categories.map((category) => (
              <option value={category.id} key={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <div className="form-row">
          <label>
            {dict.price}
            <input
              type="number"
              min="0"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </label>
          <label>
            {dict.stock}
            <input
              type="number"
              min="0"
              value={stock}
              onChange={(event) => setStock(event.target.value)}
            />
          </label>
        </div>

        <div className="form-row">
          <label>
            {dict.discountPercent}
            <input
              type="number"
              min="0"
              max="99"
              step="1"
              value={discount}
              onChange={(event) => setDiscount(event.target.value)}
            />
          </label>
          <label>
            {dict.customerPays}
            <input
              readOnly
              tabIndex={-1}
              value={`${finalPrice({ price: Number(price) || 0, discount_percent: Number(discount) || 0 }).toLocaleString("en-US")} ${product.currency}`}
            />
          </label>
        </div>

        <div className="product-options">
          <label className="check-label">
            <input
              type="checkbox"
              checked={active}
              onChange={(event) => setActive(event.target.checked)}
            />
            {dict.active}
          </label>
          <label className="check-label">
            <input
              type="checkbox"
              checked={featured}
              onChange={(event) => setFeatured(event.target.checked)}
            />
            {dict.featured}
          </label>
        </div>

        {message && <p className="form-error">{message}</p>}

        <div className="product-editor-actions">
          <button className="button sheet-reset" type="button" onClick={onClose} disabled={busy}>
            {dict.cancel}
          </button>
          <button
            className="button button-dark"
            type="button"
            disabled={busy || uploading}
            onClick={() => void save()}
          >
            {busy ? dict.saving : dict.saveClose}
          </button>
        </div>
      </div>
    </div>
  );
}
