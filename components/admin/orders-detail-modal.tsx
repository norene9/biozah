"use client";

import { useEffect, useState } from "react";
import type { StoredOrder } from "@/types/store";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type Zone = {
  wilayaCode: string;
  wilayaName: string;
  homeDeliveryPrice: number;
  deskDeliveryPrice: number;
};

// Dictionary is inferred automatically from dictionaries/en.json's shape, so this type
// just aliases the "orders" key for convenience — add/edit strings in the JSON files,
// never here.
export type OrdersDict = Dictionary["orders"];

const PAYMENT_METHOD_VALUES = ["cash", "transfer"] as const;
const STATUS_VALUES = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"] as const;

function statusLabel(dict: OrdersDict, status: string) {
  const key = status.toLowerCase() as keyof OrdersDict["statusLabels"];
  return dict.statusLabels[key] ?? status; // unrecognized status (e.g. a legacy value) still shows something
}

function money(value: number, currency = "DZD") {
  return `${(value || 0).toLocaleString("en-US")} ${currency}`;
}

export function OrderDetailModal({
  order,
  dict,
  onClose,
  onUpdated,
  onDeleted,
}: {
  order: StoredOrder;
  dict: OrdersDict;
  onClose: () => void;
  onUpdated: (updated: StoredOrder) => void;
  onDeleted: (orderId: string) => void;
}) {
  const [zones, setZones] = useState<Zone[]>([]);
  const [zonesLoading, setZonesLoading] = useState(true);

  const [status, setStatus] = useState(order.status);
  const [form, setForm] = useState({
    customer_name: order.customer_name,
    email: order.email,
    phone: order.phone,
    wilaya: order.wilaya,
    commune: order.commune,
    address: order.address,
    delivery_method: (order.delivery_method === "pickup" ? "pickup" : "home") as "home" | "pickup",
    payment_method: order.payment_method || "cash",
  });

  const [savingStatus, setSavingStatus] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/delivery-zones")
      .then((res) => res.json())
      .then((data: Zone[]) => setZones(data))
      .catch(() => setMessage(dict.zonesLoadError))
      .finally(() => setZonesLoading(false));
    // dict is stable for the component's lifetime (comes from a server-loaded locale), so it's
    // intentionally left out of the dependency array to avoid re-fetching zones on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function set(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  const selectedZone = zones.find(
    (zone) =>
      zone.wilayaName.toLowerCase() === form.wilaya.toLowerCase() || zone.wilayaCode === form.wilaya,
  );

  const deliveryCost = selectedZone
    ? form.delivery_method === "home"
      ? selectedZone.homeDeliveryPrice
      : selectedZone.deskDeliveryPrice
    : order.delivery_cost || 0;

  const itemsSubtotal = order.subtotal || 0;
  const calculatedTotal = itemsSubtotal + deliveryCost;

  async function saveStatus() {
    setSavingStatus(true);
    setMessage("");
    const response = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.order_id, status }),
    });
    if (response.ok) onUpdated({ ...order, status });
    else setMessage((await response.json().catch(() => null))?.error ?? dict.statusUpdateError);
    setSavingStatus(false);
  }

  async function saveInfo() {
    setSavingInfo(true);
    setMessage("");

    const updatedPayload = {
      ...form,
      wilaya: selectedZone ? selectedZone.wilayaName : form.wilaya,
      wilaya_code: selectedZone ? selectedZone.wilayaCode : undefined,
      delivery_cost: deliveryCost,
      total: calculatedTotal,
    };

    const response = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.order_id, ...updatedPayload }),
    });

    if (response.ok) {
      onUpdated({ ...order, ...updatedPayload, status });
    } else {
      setMessage((await response.json().catch(() => null))?.error ?? dict.infoUpdateError);
    }
    setSavingInfo(false);
  }

  async function remove() {
    setDeleting(true);
    const response = await fetch("/api/admin/orders", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.order_id }),
    });
    if (response.ok) onDeleted(order.order_id);
    else {
      setMessage((await response.json().catch(() => null))?.error ?? dict.deleteError);
      setDeleting(false);
      setConfirmDelete(false);
    }
  }
function statusLabel(dict: OrdersDict, status: string) {
  const key = status.toLowerCase() as keyof OrdersDict["statusLabels"];
  return dict?.statusLabels?.[key] ?? status; // falls back to the raw status if dict is incomplete
}
  return (
    <div className="ad-modal-overlay" onClick={onClose}>
      <div className="ad-modal ad-modal--order" onClick={(event) => event.stopPropagation()}>
        <div className="order-modal-head">
          <div>
            <span className="order-modal-id">{order.order_id}</span>
            <span className="ad-pill order-modal-status-pill">{statusLabel(dict, order.status)}</span>
          </div>
          <button type="button" className="ad-icon-btn" aria-label={dict.close} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="order-modal-scroll">
          <section className="order-modal-status">
            <div>
              <p className="order-modal-label">{dict.changeStatus}</p>
              <p className="order-modal-hint">{dict.changeStatusHint}</p>
            </div>
            <div className="order-modal-status-controls">
              <select className="ad-select" value={status} onChange={(event) => setStatus(event.target.value)}>
                {STATUS_VALUES.map((s) => (
                  <option key={s} value={s}>
                    {statusLabel(dict, s)}
                  </option>
                ))}
              </select>
              <button type="button" className="ad-btn" disabled={savingStatus} onClick={() => void saveStatus()}>
                {savingStatus ? dict.saving : dict.saveStatus}
              </button>
            </div>
          </section>

          <h3 className="order-modal-section-title">01. {dict.customerShippingTitle}</h3>

          <label>
            {dict.fullName}
            <input value={form.customer_name} onChange={(e) => set("customer_name", e.target.value)} />
          </label>
          <div className="form-row">
            <label>
              {dict.emailAddress}
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </label>
            <label>
              {dict.phoneNumber}
              <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </label>
          </div>
          <div className="form-row">
            <label>
              {dict.wilaya}
              <select
                value={selectedZone ? selectedZone.wilayaCode : form.wilaya}
                onChange={(e) => {
                  const z = zones.find((item) => item.wilayaCode === e.target.value);
                  set("wilaya", z ? z.wilayaName : e.target.value);
                }}
                disabled={zonesLoading}
              >
                {zonesLoading && <option value="">{dict.loadingWilayas}</option>}
                {!zonesLoading &&
                  zones.map((zone) => (
                    <option key={zone.wilayaCode} value={zone.wilayaCode}>
                      {zone.wilayaCode} — {zone.wilayaName}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              {dict.commune}
              <input value={form.commune} onChange={(e) => set("commune", e.target.value)} />
            </label>
          </div>
          <label>
            {dict.fullAddress}
            <textarea rows={2} value={form.address} onChange={(e) => set("address", e.target.value)} />
          </label>
          <div className="form-row">
            <label>
              {dict.deliveryMethod}
              <select
                value={form.delivery_method}
                onChange={(e) => set("delivery_method", e.target.value as "home" | "pickup")}
              >
                <option value="home">
                  {dict.homeDelivery}
                  {selectedZone ? ` · ${selectedZone.homeDeliveryPrice.toLocaleString()} DZD` : ""}
                </option>
                <option value="pickup">
                  {dict.stopDeskPickup}
                  {selectedZone ? ` · ${selectedZone.deskDeliveryPrice.toLocaleString()} DZD` : ""}
                </option>
              </select>
            </label>
            <label>
              {dict.paymentMethod}
              <select value={form.payment_method} onChange={(e) => set("payment_method", e.target.value)}>
                {PAYMENT_METHOD_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {value === "cash" ? dict.cashOnDelivery : dict.bankTransfer}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {message && <p className="form-error">{message}</p>}

          <div className="order-modal-actions">
            <button type="button" className="ad-btn" disabled={savingInfo} onClick={() => void saveInfo()}>
              {savingInfo ? dict.saving : dict.updateOrderInfo}
            </button>
          </div>

          <section className="order-modal-summary">
            <div className="order-modal-summary-head">
              <p className="order-modal-label">{dict.yourSelection}</p>
              <p className="order-modal-hint">
                {order.created_at ? new Date(order.created_at).toLocaleString("en-US") : ""}
              </p>
            </div>
            <h3 style={{ marginTop: 6 }}>{dict.orderSummary}</h3>
            <ul className="order-modal-items">
              {order?.items?.map((item, i) => (
                <li key={i}>
                  <div>
                    <p>{item.product_name}</p>
                    <p className="order-modal-hint">
                      {item.quantity} × {money(item.unit_price)}
                    </p>
                  </div>
                  <p>{money(item.subtotal)}</p>
                </li>
              ))}
            </ul>
            <div className="order-modal-totals">
              <div>
                <span>{dict.itemsSubtotal}</span>
                <span>{money(itemsSubtotal)}</span>
              </div>
              <div>
                <span>{dict.deliveryFee}</span>
                <span>{money(deliveryCost)}</span>
              </div>
              <div className="order-modal-total-line">
                <strong>{dict.total}</strong>
                <strong>{money(calculatedTotal)}</strong>
              </div>
            </div>
          </section>
        </div>

        <div className="order-modal-foot">
          <button
            type="button"
            className="order-modal-delete"
            onClick={() => setConfirmDelete(true)}
            disabled={deleting}
          >
            🗑 {dict.deleteOrder}
          </button>
          <button type="button" className="button sheet-reset" onClick={onClose}>
            {dict.close}
          </button>
        </div>

        {confirmDelete && (
          <div className="ad-modal-overlay" style={{ zIndex: 60 }} onClick={() => setConfirmDelete(false)}>
            <div className="ad-modal" style={{ maxWidth: 360 }} onClick={(e) => e.stopPropagation()}>
              <p style={{ fontWeight: 600, marginTop: 0 }}>{dict.deleteConfirmTitle}</p>
              <p className="order-modal-hint">{dict.deleteConfirmHint}</p>
              <div className="order-modal-actions" style={{ justifyContent: "flex-end", gap: 8 }}>
                <button type="button" className="button sheet-reset" onClick={() => setConfirmDelete(false)}>
                  {dict.cancel}
                </button>
                <button
                  type="button"
                  className="order-modal-delete"
                  disabled={deleting}
                  onClick={() => void remove()}
                >
                  {deleting ? dict.deleting : dict.delete}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
