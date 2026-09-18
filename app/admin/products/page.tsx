import { redirect } from "next/navigation";
import { getProducts, getCategories } from "@/lib/store";
import { getCurrentAdmin } from "@/lib/firebase/server";
import { ProductsTable } from "./products-table";
import { CollectionsRail } from "./collections-rail";
import { AdminPage, AdminPageHeader } from "@/components/admin/admin-page";
import { CollectionCreateModal } from "./collection-create-modal";
import { CollectionEditModal } from "./collection-edit-modal";

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ new?: string; collection?: string; panel?: string; view?: string; collectionEdit?: string }> }) {
  if (!(await getCurrentAdmin())) redirect("/admin/login");
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const params = await searchParams;
  const selected = params.collection ?? "all";
  const selectedCategory = categories.find((category) => category.slug === selected);
  const editingCategory = categories.find((category) => category.id === params.collectionEdit);
  return <AdminPage><AdminPageHeader eyebrow="Catalogue" title="Products & Collections." description="Manage your live product feed, collections, stock and images." action={<a className="button button-dark" href="/admin/products?panel=new-product">+ New product</a>} /><div className="products-master-detail"><CollectionsRail categories={categories} products={products} selected={selected} /><ProductsTable initialProducts={selectedCategory ? products.filter((product) => product.category_id === selectedCategory.id) : products} categories={categories} initialPanel={params.panel} /></div>{params.new === "1" && <CollectionCreateModal />}{editingCategory && <CollectionEditModal category={editingCategory} />}</AdminPage>;
}
