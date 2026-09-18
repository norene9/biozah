import { redirect } from "next/navigation";
import { getCategories } from "@/lib/store";
import { getCurrentAdmin } from "@/lib/firebase/server";
import { CategoryForm } from "./category-form";
import { CategoryEditor } from "./category-editor";

export default async function AdminCategoriesPage() {
  if (!(await getCurrentAdmin())) redirect("/admin/login");
  const categories = await getCategories();
  return <main><section className="page-intro"><p className="eyebrow">Catalogue</p><h1>Collections.</h1><p>Keep the ways customers browse feeling clear.</p></section><CategoryForm /><section className="admin-list">{categories.map((category) => <article key={category.id}><div><p className="eyebrow">Collection</p><CategoryEditor category={category} /></div><span className={category.active ? "status status-live" : "status"}>{category.active ? "Active" : "Hidden"}</span></article>)}</section></main>;
}
