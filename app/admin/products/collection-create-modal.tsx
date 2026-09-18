"use client";

import { CategoryForm } from "../categories/category-form";
import { useRouter } from "next/navigation";

export function CollectionCreateModal() {
  const router = useRouter();
  const close = () => router.push("/admin/products");
  return <CategoryForm onCreated={close} onClose={close} />;
}
