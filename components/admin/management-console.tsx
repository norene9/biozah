"use client";

import Link from "next/link";
import { Fragment } from "react";
import { ProductEditor } from "@/app/admin/products/product-editor";
import { useMemo, useState, useEffect } from "react";
import type { Category, Product, StoredOrder } from "@/types/store";
import { SafeThumb } from "./safe-thumb";
import { CategoryForm } from "@/app/admin/categories/category-form";
import { ProductCreateForm } from "@/app/admin/products/product-create-form";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/confirm-modal";
import { OrderDetailModal } from "@/components/admin/orders-detail-modal";

const LOW_STOCK = 5;

// status is a free-form string in Firestore ("Pending", "Shipped", ...), not a fixed union,
// so tone is matched case-insensitively with a sensible fallback.
function statusTone(status: string) {
  const s = status.toLowerCase();
  if (s === "pending" || s === "processing") return "ad-pill--warn";
  if (s === "cancelled" || s === "canceled" || s === "refunded") return "ad-pill--danger";
  if (s === "confirmed" || s === "shipped" || s === "delivered") return "ad-pill--ok";
  return "ad-pill--muted";
}

function money(value: number, currency = "DZD") {
  return `${value.toLocaleString("en-US")} ${currency}`;
}

function stockPill(stock: number) {
  if (stock <= 0) return { label: "Out of stock", tone: "ad-pill--danger" };
  if (stock <= LOW_STOCK) return { label: `${stock} left`, tone: "ad-pill--warn" };
  return { label: `${stock} units`, tone: "ad-pill--ok" };
}

function Thumb({ src, name }: { src?: string | null; name: string }) {
  return <SafeThumb src={src} name={name} size={38} />;
}

function StatCard({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note: string;
  tone: string;
}) {
  return (
    <div className="ad-stat">
      <div className="ad-stat-top">
        <p className="ad-stat-label">{label}</p>
        <span className={`ad-pill ${tone}`}>{note}</span>
      </div>
      <p className="ad-stat-value">{value}</p>
    </div>
  );
}

export function ManagementConsole({
  initialProducts,
  initialCategories,
  initialOrders,
}: {
  initialProducts: Product[];
  initialCategories: Category[];
  initialOrders: StoredOrder[];
}) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  useEffect(() => setProducts(initialProducts), [initialProducts]);
  const [categories, setCategories] = useState(initialCategories);
  useEffect(() => setCategories(initialCategories), [initialCategories]);
  const [orders, setOrders] = useState(initialOrders);
  useEffect(() => setOrders(initialOrders), [initialOrders]);

  const [productQuery, setProductQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [orderQuery, setOrderQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [viewingOrder, setViewingOrder] = useState<StoredOrder | null>(null);

  const categoryName = useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c.name]));
    return (id: string) => map.get(id) ?? "Uncategorized";
  }, [categories]);

  const productCountByCategory = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products)
      counts.set(product.category_id, (counts.get(product.category_id) ?? 0) + 1);
    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    return products.filter((p) => {
      const matchesQuery =
        !q || p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === "all" || p.category_id === categoryFilter;
      return matchesQuery && matchesCategory;
    });
  }, [products, productQuery, categoryFilter]);

  const filteredOrders = useMemo(() => {
    const q = orderQuery.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesQuery =
        !q || o.customer_name.toLowerCase().includes(q) || o.order_id.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || o.status.toLowerCase() === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [orders, orderQuery, statusFilter]);

  const totalRevenue = useMemo(
    () =>
      orders
        .filter((o) => o.status.toLowerCase() !== "cancelled")
        .reduce((sum, o) => sum + o.total, 0),
    [orders],
  );
  const pendingCount = orders.filter((o) => o.status.toLowerCase() === "pending").length;
  const activeProducts = products.filter((p) => p.active).length;
  const activeCategories = categories.filter((c) => c.active).length;

  const [pendingDeleteCategory, setPendingDeleteCategory] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function deleteCategory(category: Category) {
    setDeleting(true);
    try {
      const response = await fetch("/api/admin/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: category.id }),
      });
      if (!response.ok) {
        window.alert((await response.json().catch(() => null))?.error ?? "Unable to delete collection.");
        return;
      }
      setCategories((current) => current.filter((item) => item.id !== category.id));
      router.refresh(); // re-syncs the products table/count now that this category's products are gone too
    } finally {
      setDeleting(false);
      setPendingDeleteCategory(null);
    }
  }

  return (
    <>
      <section className="ad-page-head">
        <div>
          <h1>Store overview.</h1>
          <p>Products, collections and orders in one place.</p>
        </div>
        <Link href="/" className="ad-link-btn">
          Store overview →
        </Link>
      </section>

      <section className="ad-stats" aria-label="Overview">
        <StatCard
          label="Total revenue"
          value={money(totalRevenue)}
          note={`${orders.length} orders`}
          tone="ad-pill--ok"
        />
        <StatCard
          label="Pending orders"
          value={String(pendingCount)}
          note={pendingCount > 0 ? "Action needed" : "All clear"}
          tone={pendingCount > 0 ? "ad-pill--warn" : "ad-pill--muted"}
        />
        <StatCard
          label="Products"
          value={String(products.length)}
          note={`${activeProducts} active`}
          tone="ad-pill--muted"
        />
        <StatCard
          label="Collections"
          value={String(categories.length)}
          note={`${activeCategories} active`}
          tone="ad-pill--ok"
        />
      </section>

      <section className="ad-card">
        <div className="ad-card-head">
          <div>
            <h2>Collections</h2>
            <p>Organize your products into shopping collections</p>
          </div>
          <button type="button" className="ad-btn" onClick={() => setShowCategoryForm(true)}>
            + New collection
          </button>
        </div>
        {showCategoryForm && (
          <CategoryForm
            onClose={() => setShowCategoryForm(false)}
            onCreated={(category?: Category) => {
              setShowCategoryForm(false);
              if (category) setCategories((current) => [category, ...current]);
              router.refresh();
            }}
          />
        )}
        {categories.length === 0 ? (
          <p className="ad-empty">
            No collections yet. Use "+ New collection" above to create your first one.
          </p>
        ) : (
          <div className="ad-cat-grid">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/admin/categories/${category.id}/edit`}
                className="ad-cat-tile"
              >
                <SafeThumb src={category.image_url} name={category.name} size={44} radius={12} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p>{category.name}</p>
                  <p>
                    {productCountByCategory.get(category.id) ?? 0} products
                    {!category.active && " · Hidden"}
                  </p>
                </div>
                <button
                  type="button"
                  className="ad-icon-btn ad-icon-btn--danger"
                  aria-label={`Delete ${category.name}`}
                  title="Delete collection"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setPendingDeleteCategory(category);
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6" />
                  </svg>
                </button>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="ad-card">
        <div className="ad-card-head">
          <div>
            <h2>Products</h2>
            <p>Manage pricing, stock and images</p>
          </div>
          <div className="ad-card-tools">
            <input
              className="ad-input"
              placeholder="Search products…"
              value={productQuery}
              onChange={(e) => setProductQuery(e.target.value)}
            />
            <select
              className="ad-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All collections</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button type="button" className="ad-btn" onClick={() => setShowProductForm(true)}>
              + New product
            </button>
          </div>
          {showProductForm && (
            <ProductCreateForm
              categories={categories}
              onClose={() => setShowProductForm(false)}
              onCreated={() => {
                setShowProductForm(false);
                router.refresh();
              }}
            />
          )}
        </div>
        {filteredProducts.length === 0 ? (
          <p className="ad-empty">
            {products.length === 0 ? "No products yet." : "No products match your search."}
          </p>
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Collection</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const badge = stockPill(product.stock);
                  const isEditing = editingProductId === product.id;
                  return (
                    <Fragment key={product.id}>
                      <tr>
                        <td>
                          <div className="ad-cell-main">
                            <Thumb src={product.image_url} name={product.name} />
                            <div style={{ minWidth: 0 }}>
                              <p>{product.name}</p>
                              <p>/{product.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td>{categoryName(product.category_id)}</td>
                        <td>{money(product.price, product.currency)}</td>
                        <td>
                          <span className={`ad-pill ${badge.tone}`}>{badge.label}</span>
                        </td>
                        <td>
                          <span
                            className={`ad-pill ${product.active ? "ad-pill--ok" : "ad-pill--muted"}`}
                          >
                            {product.active ? "Active" : "Hidden"}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            type="button"
                            className="ad-link-btn"
                            onClick={() => setEditingProductId(isEditing ? null : product.id)}
                          >
                            {isEditing ? "Close" : "Edit"}
                          </button>
                        </td>
                      </tr>
                      {isEditing && (
                        <tr className="ad-table-expand">
                          <td colSpan={6}>
                            <ProductEditor
                              product={product}
                              categories={categories}
                              onClose={() => setEditingProductId(null)}
                              onSaved={(updated) => {
                                setProducts((current) =>
                                  current.map((item) => (item.id === updated.id ? updated : item)),
                                );
                                setEditingProductId(null);
                                router.refresh(); // background sync only — the row above already shows the real edit
                              }}
                            />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="ad-card">
        <div className="ad-card-head">
          <div>
            <h2>Orders</h2>
            <p>Track and fulfill recent purchases</p>
          </div>
          <div className="ad-card-tools">
            <input
              className="ad-input"
              placeholder="Search customer or ID…"
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
            />
            <select
              className="ad-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              {/* If you use other status strings in Firestore, add matching options here. */}
            </select>
          </div>
        </div>
        {filteredOrders.length === 0 ? (
          <p className="ad-empty">
            {orders.length === 0 ? "No orders yet." : "No orders match your search."}
          </p>
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th aria-label="Details" />
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.order_id}>
                    <td>{order.order_id}</td>
                    <td>
                      <div className="ad-cell-main">
                        <div style={{ minWidth: 0 }}>
                          <p>{order.customer_name}</p>
                          <p>
                            {order?.items?.length} item{order?.items?.length === 1 ? "" : "s"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>{new Date(order.created_at).toLocaleDateString("en-US")}</td>
                    <td>{money(order.total)}</td>
                    <td>
                      <span className={`ad-pill ${statusTone(order.status)}`}>{order.status}</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className="ad-link-btn"
                        onClick={() => setViewingOrder(order)}
                      >
                        View
                      </button>
                    </td>
                    {viewingOrder && (
                      <OrderDetailModal
                        order={viewingOrder}
                        onClose={() => setViewingOrder(null)}
                        onUpdated={(updated) => {
                          setOrders((current) =>
                            current.map((o) => (o.order_id === updated.order_id ? updated : o)),
                          );
                          setViewingOrder(updated);
                        }}
                        onDeleted={(orderId) => {
                          setOrders((current) => current.filter((o) => o.order_id !== orderId));
                          setViewingOrder(null);
                        }}
                      />
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ConfirmModal
        open={Boolean(pendingDeleteCategory)}
        title="Delete collection?"
        message={
          pendingDeleteCategory
            ? `"${pendingDeleteCategory.name}" and its ${
                productCountByCategory.get(pendingDeleteCategory.id) ?? 0
              } product(s) will be permanently deleted.`
            : ""
        }
        confirmLabel={deleting ? "Deleting…" : "Delete"}
        onCancel={() => setPendingDeleteCategory(null)}
        onConfirm={() => pendingDeleteCategory && void deleteCategory(pendingDeleteCategory)}
      />
    </>
  );
}
