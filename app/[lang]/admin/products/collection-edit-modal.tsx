"use client";

import { useRouter } from "next/navigation";
import type { Category } from "@/types/store";
import { CategoryEditor } from "../categories/category-editor";

export function CollectionEditModal({ category }: { category: Category }) {
  const router = useRouter();

  const closeModal = () => {
    router.push("/admin/products");
  };

  return (
    <div
      className="collection-modal-overlay"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && closeModal()}
    >
      <section
        className="collection-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-collection-title"
      >
        <div className="drawer-header">
          <h2 id="edit-collection-title">Edit collection</h2>

          <button
            type="button"
            className="drawer-close"
            aria-label="Close edit collection"
            onClick={closeModal}
          >
            ×
          </button>
        </div>

        <CategoryEditor category={category} />

        <footer className="drawer-footer"></footer>
      </section>
    </div>
  );
}
