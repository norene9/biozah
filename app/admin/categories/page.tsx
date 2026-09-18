import { redirect } from "next/navigation";
import { getCategories } from "@/lib/store";
import { getCurrentAdmin } from "@/lib/firebase/server";
import { AdminPage, AdminPageHeader } from "@/components/admin/admin-page";
import { CollectionsManager } from "./collections-manager";

export default async function AdminCategoriesPage({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  if (!(await getCurrentAdmin())) redirect("/admin/login");
  const categories = await getCategories();
  const params = await searchParams;
  return <AdminPage><AdminPageHeader eyebrow="Catalogue" title="Collections." description="Keep the ways customers browse feeling clear." action={<a className="button button-dark" href="/admin/categories?new=1">+ New collection</a>} /><CollectionsManager initialCategories={categories} initialCreate={params.new === "1"} /></AdminPage>;
}
