"use client";

import { CategoryForm } from "../categories/category-form";
import { useRouter } from "next/navigation";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type FormsDict = Dictionary["forms"];

export function CollectionCreateModal({ dict }: { dict: FormsDict }) {
  const router = useRouter();
  const close = () => router.push("/admin/products");

  return <CategoryForm dict={dict} onCreated={close} onClose={close} />;
}