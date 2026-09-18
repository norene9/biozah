import { redirect } from "next/navigation";
import { getProducts } from "@/lib/store";
import { getCurrentAdmin } from "@/lib/firebase/server";
import { ImageUploader } from "./image-uploader";
import { ProductEditor } from "./product-editor";
import { getCategories } from "@/lib/store";
import { ProductCreateForm } from "./product-create-form";

export default async function AdminProductsPage() {
  if (!(await getCurrentAdmin())) redirect("/admin/login");
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  return <main><section className="page-intro"><p className="eyebrow">Catalogue</p><h1>Products.</h1><p>Review the live product feed, stock status, and Cloudinary image.</p></section><ProductCreateForm categories={categories} /><section className="admin-list">{products.map((product) => <article key={product.id}><div><p className="eyebrow">{product.featured ? "Featured" : "Product"}</p><h2>{product.name}</h2><p>{product.price.toLocaleString()} {product.currency} · {product.stock} in stock</p><ProductEditor product={product} /><ImageUploader productId={product.id} currentUrl={product.image_url} currentPublicId={product.image_public_id} /></div><span className={product.active ? "status status-live" : "status"}>{product.active ? "Active" : "Hidden"}</span></article>)}</section></main>;
}
