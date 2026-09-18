import { redirect } from "next/navigation";
import { getCategories, getProducts } from "@/lib/store";
import { getCurrentAdmin } from "@/lib/firebase/server";
import { AdminPage, AdminPageHeader } from "@/components/admin/admin-page";
import { CollectionsManager } from "./collections-manager";

export default async function AdminCategoriesPage({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  if (!(await getCurrentAdmin())) redirect("/admin/login");
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const params = await searchParams;
  return <AdminPage><AdminPageHeader eyebrow="Catalogue" title="Collections." description="Keep the ways customers browse feeling clear." action={<a className="button button-dark" href="/admin/categories?new=1">+ New collection</a>} /><CollectionsManager initialCategories={categories} products={products} initialCreate={params.new === "1"} /></AdminPage>;
}
