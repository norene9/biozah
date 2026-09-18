import { redirect } from "next/navigation";
import { getProducts, getCategories } from "@/lib/store";
import { getCurrentAdmin } from "@/lib/firebase/server";
import { ProductsTable } from "./products-table";

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  if (!(await getCurrentAdmin())) redirect("/admin/login");
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  await searchParams;
    return <main className="admin-page"><div className="admin-container"><header className="admin-page-header"><div><p className="eyebrow">Catalogue</p><h1>Products.</h1><p>Manage your live product feed, stock and images.</p></div><a className="button button-dark" href="#new-product">+ New product</a></header><ProductsTable initialProducts={products} categories={categories} /></div></main>;
}
