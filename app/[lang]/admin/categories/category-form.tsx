"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploadField } from "@/app/[lang]/admin/products/image-upload-field";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

export function CategoryForm({
  onCreated,
  onClose,
  dict,
}: {
  onCreated?: () => void;
  onClose?: () => void;
  dict: Dictionary["forms"];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [image, setImage] = useState({ url: "", publicId: "" });
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, image_url: image.url, image_public_id: image.publicId }),
    });
    if (!response.ok) {
      setError((await response.json()).error ?? dict.createError);
      setBusy(false);
      return;
    }
    setBusy(false);
    onCreated?.();
    router.refresh();
  }
  return (
    <div
      className="collection-modal-overlay"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}
    >
      <form
        className="collection-modal"
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-collection-title"
      >
        <div className="drawer-header">
          <div>
            <p className="eyebrow">{dict.catalogue}</p>
            <h2 id="new-collection-title">{dict.newCollectionTitle}</h2>
          </div>
          <button className="icon-button" type="button" aria-label={dict.closeDialog} onClick={onClose}>
            ×
          </button>
        </div>
        <ImageUploadField
          folder="biozah/categories"
          url={image.url}
          publicId={image.publicId}
          onChange={(url, publicId) => setImage({ url, publicId })}
        />
        <label>
          {dict.name}
          <input name="name" required placeholder={dict.collectionNamePlaceholder} />
        </label>
        <label>
          {dict.description}
          <textarea name="description" rows={3} placeholder={dict.collectionDescPlaceholder} />
        </label>
        {error && <p className="form-error">{error}</p>}
        <footer className="drawer-footer">
          <button className="button sheet-reset" type="button" onClick={onClose}>
            {dict.cancel}
          </button>
          <button className="button button-dark" disabled={busy}>
            {busy ? dict.creating : dict.createCollection}
          </button>
        </footer>
      </form>
    </div>
  );
}
