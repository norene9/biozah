import { redirect } from "next/navigation";
import { getCategories, getProducts } from "@/lib/store";
import { getCurrentAdmin } from "@/lib/firebase/server";

export default async function AdminPage() {
  if (!(await getCurrentAdmin())) redirect("/admin/login");
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  return (
    <main>
      <section className="page-intro">
        <p className="eyebrow">Private studio</p>
        <h1>Good morning.</h1>
        <p>Keep the catalogue considered and the day moving.</p>
      </section>
      <section className="admin-grid">
        <article>
          <p className="eyebrow">Products</p>
          <strong>{products.length}</strong>
          <p>Items in the catalogue</p>
        </article>
        <article>
          <p className="eyebrow">Collections</p>
          <strong>{categories.length}</strong>
          <p>Active shopping collections</p>
        </article>
      </section>
      <section className="admin-panel">
        <div>
          <p className="eyebrow">Workspace</p>
          <h2>
            <a href="/admin/products">Products</a> · <a href="/admin/categories">Collections</a> ·{" "}
            <a href="/admin/orders">Orders</a>
          </h2>
          <p>
            Review the current catalogue and order storage from this authenticated boundary.
            Mutations stay server-side and never expose privileged credentials.
          </p>
        </div>
      </section>
    </main>
  );
}
