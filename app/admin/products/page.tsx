import { redirect } from "next/navigation";
import { getProducts, getCategories } from "@/lib/store";
import { getCurrentAdmin } from "@/lib/firebase/server";
import { ProductsTable } from "./products-table";
import { CollectionsRail } from "./collections-rail";

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ new?: string; collection?: string; panel?: string }> }) {
  if (!(await getCurrentAdmin())) redirect("/admin/login");
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const params = await searchParams;
  const selected = params.collection ?? "all";
  const selectedCategory = categories.find((category) => category.slug === selected);
  return <main className="admin-page"><div className="admin-container"><header className="admin-page-header"><div><p className="eyebrow">Catalogue</p><h1>Products.</h1><p>Manage your live product feed, stock and images.</p></div><a className="button button-dark" href="/admin/products?panel=new-product">+ New product</a></header><div className="products-master-detail"><CollectionsRail categories={categories} products={products} selected={selected} /><ProductsTable initialProducts={selectedCategory ? products.filter((product) => product.category_id === selectedCategory.id) : products} categories={categories} initialPanel={params.panel} /></div></div></main>;
}
