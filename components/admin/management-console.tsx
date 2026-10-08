"use client";

import Link from "next/link";
import { Fragment, useMemo, useState, useEffect } from "react";
import { ProductEditor } from "@/app/[lang]/admin/products/product-editor";
import type { Category, Product, StoredOrder } from "@/types/store";
import { SafeThumb } from "./safe-thumb";
import { CategoryForm } from "@/app/[lang]/admin/categories/category-form";
import { ProductCreateForm } from "@/app/[lang]/admin/products/product-create-form";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/confirm-modal";
import { OrderDetailModal } from "@/components/admin/orders-detail-modal";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AdminDict = Dictionary["admin"];

const LOW_STOCK = 5;

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

function stockPill(stock: number, dict: AdminDict) {
  if (stock <= 0) return { label: dict.outOfStock, tone: "ad-pill--danger" };
  if (stock <= LOW_STOCK) return { label: dict.stockLeft.replace("{count}", String(stock)), tone: "ad-pill--warn" };
  return { label: dict.stockUnits.replace("{count}", String(stock)), tone: "ad-pill--ok" };
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
  dict,
  formsDict,
  ordersDict, // 👈 1. Pass ordersDict explicitly
}: {
  initialProducts: Product[];
  initialCategories: Category[];
  initialOrders: StoredOrder[];
  dict: AdminDict;
  formsDict: Dictionary["forms"];
  ordersDict: Dictionary["orders"]; // 👈 Typed correctly as Dictionary["orders"]
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
    return (id: string) => map.get(id) ?? dict.uncategorized;
  }, [categories, dict.uncategorized]);

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
        window.alert(
          (await response.json().catch(() => null))?.error ?? "Unable to delete collection.",
        );
        return;
      }
      setCategories((current) => current.filter((item) => item.id !== category.id));
      router.refresh();
    } finally {
      setDeleting(false);
      setPendingDeleteCategory(null);
    }
  }

  return (
    <>
      <section className="ad-page-head">
        <div>
          <h1>{dict.overview}</h1>
          <p>{dict.overviewSub}</p>
        </div>
        <Link href="/" className="ad-link-btn">
          {dict.storeLink} →
        </Link>
      </section>

      <section className="ad-stats" aria-label="Overview">
        <StatCard
          label={dict.totalRevenue}
          value={money(totalRevenue)}
          note={`${orders.length} ${dict.orders.total}`}
          tone="ad-pill--ok"
        />
        <StatCard
          label={dict.pendingOrders}
          value={String(pendingCount)}
          note={pendingCount > 0 ? dict.actionNeeded : dict.allClear}
          tone={pendingCount > 0 ? "ad-pill--warn" : "ad-pill--muted"}
        />
        <StatCard
          label={dict.products}
          value={String(products.length)}
          note={`${activeProducts} ${dict.active}`}
          tone="ad-pill--muted"
        />
        <StatCard
          label={dict.collections}
          value={String(categories.length)}
          note={`${activeCategories} ${dict.active}`}
          tone="ad-pill--ok"
        />
      </section>

      <section className="ad-card">
        <div className="ad-card-head">
          <div>
            <h2>{dict.collections}</h2>
            <p>{dict.collectionsSub}</p>
          </div>
          <button type="button" className="ad-btn" onClick={() => setShowCategoryForm(true)}>
            {dict.newCollection}
          </button>
        </div>
        {showCategoryForm && (
          <CategoryForm
            dict={formsDict}
            onClose={() => setShowCategoryForm(false)}
            onCreated={(category?: Category) => {
              setShowCategoryForm(false);
              if (category) setCategories((current) => [category, ...current]);
              router.refresh();
            }}
          />
        )}
        {categories.length === 0 ? (
          <p className="ad-empty">{dict.noCollections}</p>
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
                    {productCountByCategory.get(category.id) ?? 0} {dict.products}
                    {!category.active && ` · ${dict.hidden}`}
                  </p>
                </div>
                <button
                  type="button"
                  className="ad-icon-btn ad-icon-btn--danger"
                  aria-label={`${dict.delete} ${category.name}`}
                  title={dict.deleteCollection}
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
            <h2>{dict.products}</h2>
            <p>{dict.managePricing}</p>
          </div>
          <div className="ad-card-tools">
            <input
              className="ad-input"
              placeholder={dict.searchProducts}
              value={productQuery}
              onChange={(e) => setProductQuery(e.target.value)}
            />
            <select
              className="ad-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">{dict.allCollections}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button type="button" className="ad-btn" onClick={() => setShowProductForm(true)}>
              {dict.newProduct}
            </button>
          </div>
          {showProductForm && (
            <ProductCreateForm
              dict={formsDict}
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
            {products.length === 0 ? dict.noProducts : dict.noProductsMatch}
          </p>
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>{dict.productCol}</th>
                  <th>{dict.collectionCol}</th>
                  <th>{dict.priceCol}</th>
                  <th>{dict.stockCol}</th>
                  <th>{dict.statusCol}</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const badge = stockPill(product.stock, dict);
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
                            {product.active ? dict.activeStatus : dict.hidden}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            type="button"
                            className="ad-link-btn"
                            onClick={() => setEditingProductId(isEditing ? null : product.id)}
                          >
                            {isEditing ? dict.close : dict.edit}
                          </button>
                        </td>
                      </tr>
                      {isEditing && (
                        <tr className="ad-table-expand">
                          <td colSpan={6}>
                            <ProductEditor
                              dict={formsDict}
                              product={product}
                              categories={categories}
                              onClose={() => setEditingProductId(null)}
                              onSaved={(updated) => {
                                setProducts((current) =>
                                  current.map((item) => (item.id === updated.id ? updated : item)),
                                );
                                setEditingProductId(null);
                                router.refresh();
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
            <h2>{dict.ordersTitle}</h2>
            <p>{dict.ordersSub}</p>
          </div>
          <div className="ad-card-tools">
            <input
              className="ad-input"
              placeholder={dict.searchOrders}
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
            />
            <select
              className="ad-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">{dict.allStatuses}</option>
              <option value="pending">{dict.statusPending}</option>
              <option value="confirmed">{dict.statusConfirmed}</option>
              <option value="shipped">{dict.statusShipped}</option>
              <option value="delivered">{dict.statusDelivered}</option>
              <option value="cancelled">{dict.statusCancelled}</option>
            </select>
          </div>
        </div>
        {filteredOrders.length === 0 ? (
          <p className="ad-empty">
            {orders.length === 0 ? dict.noOrders : dict.noOrdersMatch}
          </p>
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>{dict.orderCol}</th>
                  <th>{dict.customerCol}</th>
                  <th>{dict.dateCol}</th>
                  <th>{dict.totalCol}</th>
                  <th>{dict.statusCol}</th>
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
                            {order?.items?.length}{" "}
                            {order?.items?.length === 1 ? dict.itemSingular : dict.itemPlural}
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
                        {dict.view}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 👈 2. Render OrderDetailModal cleanly outside the table */}
      {viewingOrder && (
        <OrderDetailModal
          order={viewingOrder}
          dict={ordersDict} // 👈 Uses the passed ordersDict object
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

      <ConfirmModal
        open={Boolean(pendingDeleteCategory)}
        title={dict.deleteCollectionTitle}
        message={
          pendingDeleteCategory
            ? `"${pendingDeleteCategory.name}" ${dict.deleteCollectionMsg}`
            : ""
        }
        confirmLabel={deleting ? dict.deleting : dict.delete}
        onCancel={() => setPendingDeleteCategory(null)}
        onConfirm={() => pendingDeleteCategory && void deleteCategory(pendingDeleteCategory)}
      />
    </>
  );
}