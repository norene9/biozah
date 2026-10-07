"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Category, Product } from "@/types/store";
import { ConfirmModal } from "@/components/confirm-modal";
import { ProductCard } from "./product-card";
import { ProductsToolbar } from "./products-toolbar";
import { ProductDrawer } from "./product-drawer";
import { StockBadge } from "./stock-badge";

export function ProductsTable({
  initialProducts,
  categories,
  initialPanel,
}: {
  initialProducts: Product[];
  categories: Category[];
  initialPanel?: string;
}) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(false);
  const [drawer, setDrawer] = useState<Product | null | undefined>(
    initialPanel === "new-product" ? null : undefined,
  );
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  useEffect(() => {
    if (initialPanel?.startsWith("product:"))
      setDrawer(products.find((product) => product.id === initialPanel.slice(8)));
  }, [initialPanel, products]);
  const categoryName = (id: string) =>
    categories.find((item) => item.id === id)?.name ?? "Unassigned";
  const filtered = useMemo(
    () =>
      products
        .filter(
          (product) =>
            (!search ||
              `${product.name} ${product.slug}`.toLowerCase().includes(search.toLowerCase())) &&
            (category === "all" || product.category_id === category) &&
            (status === "all" ||
              (status === "active" && product.active) ||
              (status === "inactive" && !product.active) ||
              (status === "featured" && product.featured) ||
              (status === "out" && product.stock === 0)),
        )
        .sort((a, b) =>
          sort === "name"
            ? a.name.localeCompare(b.name)
            : sort === "price"
              ? a.price - b.price
              : sort === "stock"
                ? a.stock - b.stock
                : 0,
        ),
    [products, search, category, status, sort],
  );
  async function toggle(product: Product, active: boolean) {
    const response = await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product.id,
        price: product.price,
        stock: product.stock,
        active,
        featured: product.featured,
      }),
    });
    if (!response.ok) {
      window.alert((await response.json()).error ?? "Unable to update product status.");
      return;
    }
    setProducts((current) =>
      current.map((item) => (item.id === product.id ? { ...item, active } : item)),
    );
  }
  async function remove(product: Product) {
    const response = await fetch("/api/admin/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id }),
    });
    if (response.ok) setProducts((current) => current.filter((item) => item.id !== product.id));
    else window.alert((await response.json()).error ?? "Unable to delete product.");
    setPendingDelete(null);
  }
  function refresh() {
    setLoading(true);
    router.refresh();
    window.setTimeout(() => setLoading(false), 700);
  }
  function closeDrawer() {
    setDrawer(undefined);
    router.push("/admin/products");
  }
  function openProduct(product?: Product) {
    setDrawer(product ?? null);
    router.push(
      product ? `/admin/products?panel=product:${product.id}` : "/admin/products?panel=new-product",
    );
  }
  function saved(product?: Product) {
    if (!product) return refresh();
    setProducts((current) =>
      current.some((item) => item.id === product.id)
        ? current.map((item) => (item.id === product.id ? product : item))
        : [product, ...current],
    );
    router.refresh();
  }
  return (
    <>
      <section className={drawer !== undefined ? "products-content has-panel" : "products-content"}>
        <ProductsToolbar
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          status={status}
          setStatus={setStatus}
          sort={sort}
          setSort={setSort}
          categories={categories}
          count={filtered.length}
          onRefresh={refresh}
          loading={loading}
        />
        <section className="products-table-wrap">
          {filtered.length ? (
            <table className="products-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th className="hide-tablet">Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Active</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id} onClick={() => openProduct(product)}>
                    <td>
                      <div className="table-thumb">
                        {product.image_url && <img src={product.image_url} alt="" />}
                      </div>
                    </td>
                    <td>
                      <strong>{product.name}</strong>
                      <small>/{product.slug}</small>
                    </td>
                    <td className="hide-tablet">{categoryName(product.category_id)}</td>
                    <td>
                      {product.price.toLocaleString("en-US")} {product.currency}
                    </td>
                    <td>
                      <StockBadge stock={product.stock} />
                    </td>
                    <td>
                      <label className="toggle-label" onClick={(event) => event.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={product.active}
                          onChange={(event) => void toggle(product, event.target.checked)}
                        />
                        <span />
                      </label>
                    </td>
                    <td>{product.featured ? "Yes" : "No"}</td>
                    <td>
                      <button
                        className="button sheet-reset"
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          openProduct(product);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="row-delete"
                        type="button"
                        aria-label={`Delete ${product.name}`}
                        title="Delete product"
                        onClick={(event) => {
                          event.stopPropagation();
                          setPendingDelete(product);
                        }}
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="product-empty">
              <h2>{search || status !== "all" ? "No results" : "No products yet"}</h2>
              <p>
                {search || status !== "all"
                  ? "Clear your filters to see more products."
                  : "Create your first product to begin."}
              </p>
              <button className="button button-dark" type="button" onClick={() => openProduct()}>
                + New product
              </button>
            </div>
          )}
        </section>
        <div className="product-mobile-list">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              categoryName={categoryName(product.category_id)}
              onEdit={() => openProduct(product)}
              onToggle={(active) => void toggle(product, active)}
            />
          ))}
        </div>
        {drawer !== undefined && (
          <ProductDrawer
            product={drawer ?? undefined}
            categories={categories}
            onClose={closeDrawer}
            onSaved={saved}
          />
        )}
      </section>
      <ConfirmModal
        open={Boolean(pendingDelete)}
        title="Delete product?"
        message={pendingDelete ? `${pendingDelete.name} will be deleted entirely ` : ""}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && void remove(pendingDelete)}
      />
    </>
  );
}
