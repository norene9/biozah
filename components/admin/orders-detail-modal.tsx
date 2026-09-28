"use client";

import { useEffect, useState } from "react";
import type { StoredOrder } from "@/types/store";

type Zone = {
  wilayaCode: string;
  wilayaName: string;
  homeDeliveryPrice: number;
  deskDeliveryPrice: number;
};

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash on delivery" },
  { value: "transfer", label: "Bank transfer" },
];

const STATUSES = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];

function money(value: number, currency = "DZD") {
  return `${(value || 0).toLocaleString("en-US")} ${currency}`;
}

export function OrderDetailModal({
  order,
  onClose,
  onUpdated,
  onDeleted,
}: {
  order: StoredOrder;
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

  // Fetch dynamic delivery zones (same as Checkout)
  useEffect(() => {
    fetch("/api/delivery-zones")
      .then((res) => res.json())
      .then((data: Zone[]) => {
        setZones(data);
      })
      .catch(() => setMessage("Unable to load delivery pricing zones."))
      .finally(() => setZonesLoading(false));
  }, []);

  function set(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  // Find the zone matching current wilaya name or wilaya code
  const selectedZone = zones.find(
    (zone) =>
      zone.wilayaName.toLowerCase() === form.wilaya.toLowerCase() ||
      zone.wilayaCode === form.wilaya
  );

  // Calculate dynamic delivery price based on selected zone & method
  const deliveryCost = selectedZone
    ? form.delivery_method === "home"
      ? selectedZone.homeDeliveryPrice
      : selectedZone.deskDeliveryPrice
    : order.delivery_cost || 0;

  const itemsSubtotal = order.subtotal || 0;
  const calculatedTotal = itemsSubtotal  + deliveryCost;

  async function saveStatus() {
    setSavingStatus(true);
    setMessage("");
    const response = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.order_id, status }),
    });
    if (response.ok) onUpdated({ ...order, status });
    else setMessage((await response.json().catch(() => null))?.error ?? "Unable to update status.");
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
      setMessage((await response.json().catch(() => null))?.error ?? "Unable to update order.");
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
      setMessage((await response.json().catch(() => null))?.error ?? "Unable to delete order.");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div className="ad-modal-overlay" onClick={onClose}>
      <div className="ad-modal ad-modal--order" onClick={(event) => event.stopPropagation()}>
        <div className="order-modal-head">
          <div>
            <span className="order-modal-id">{order.order_id}</span>
            <span className={`ad-pill order-modal-status-pill`}>{order.status}</span>
          </div>
          <button type="button" className="ad-icon-btn" aria-label="Close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="order-modal-scroll">
          <section className="order-modal-status">
            <div>
              <p className="order-modal-label">Change order status</p>
              <p className="order-modal-hint">Updating will save to backend &amp; trigger email alerts.</p>
            </div>
            <div className="order-modal-status-controls">
              <select className="ad-select" value={status} onChange={(event) => setStatus(event.target.value)}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button type="button" className="ad-btn" disabled={savingStatus} onClick={() => void saveStatus()}>
                {savingStatus ? "Saving…" : "Save Status"}
              </button>
            </div>
          </section>

          <h3 className="order-modal-section-title">01. Customer &amp; Shipping Details</h3>

          <label>
            Full Name
            <input value={form.customer_name} onChange={(e) => set("customer_name", e.target.value)} />
          </label>
          <div className="form-row">
            <label>
              Email Address
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </label>
            <label>
              Phone Number
              <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </label>
          </div>
          <div className="form-row">
            <label>
              Wilaya
              <select
                value={selectedZone ? selectedZone.wilayaCode : form.wilaya}
                onChange={(e) => {
                  const z = zones.find((item) => item.wilayaCode === e.target.value);
                  set("wilaya", z ? z.wilayaName : e.target.value);
                }}
                disabled={zonesLoading}
              >
                {zonesLoading && <option value="">Loading wilayas…</option>}
                {!zonesLoading &&
                  zones.map((zone) => (
                    <option key={zone.wilayaCode} value={zone.wilayaCode}>
                      {zone.wilayaCode} — {zone.wilayaName}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              Commune
              <input value={form.commune} onChange={(e) => set("commune", e.target.value)} />
            </label>
          </div>
          <label>
            Full Delivery Address
            <textarea rows={2} value={form.address} onChange={(e) => set("address", e.target.value)} />
          </label>
          <div className="form-row">
            <label>
              Delivery Method
              <select
                value={form.delivery_method}
                onChange={(e) => set("delivery_method", e.target.value as "home" | "pickup")}
              >
                <option value="home">
                  Home delivery
                  {selectedZone ? ` · ${selectedZone.homeDeliveryPrice.toLocaleString()} DZD` : ""}
                </option>
                <option value="pickup">
                  Stop desk / pickup
                  {selectedZone ? ` · ${selectedZone.deskDeliveryPrice.toLocaleString()} DZD` : ""}
                </option>
              </select>
            </label>
            <label>
              Payment Method
              <select value={form.payment_method} onChange={(e) => set("payment_method", e.target.value)}>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {message && <p className="form-error">{message}</p>}

          <div className="order-modal-actions">
            <button type="button" className="ad-btn" disabled={savingInfo} onClick={() => void saveInfo()}>
              {savingInfo ? "Saving…" : "Update Order Info"}
            </button>
          </div>

          <section className="order-modal-summary">
            <div className="order-modal-summary-head">
              <p className="order-modal-label">Your selection</p>
              <p className="order-modal-hint">
                {order.created_at ? new Date(order.created_at).toLocaleString("en-US") : ""}
              </p>
            </div>
            <h3 style={{ marginTop: 6 }}>Order summary</h3>
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
                <span>Items Subtotal</span>
                <span>{money(itemsSubtotal)}</span>
              </div>
              {/* {discountAmount > 0 && (
                <div style={{ color: "#2e6041" }}>
                  <span>Discount Savings</span>
                  <span>- {money(discountAmount)}</span>
                </div>
              )} */}
              <div>
                <span>Delivery Fee</span>
                <span>{money(deliveryCost)}</span>
              </div>
              <div className="order-modal-total-line">
                <strong>Total</strong>
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
            🗑 Delete Order
          </button>
          <button type="button" className="button sheet-reset" onClick={onClose}>
            Close
          </button>
        </div>

        {confirmDelete && (
          <div className="ad-modal-overlay" style={{ zIndex: 60 }} onClick={() => setConfirmDelete(false)}>
            <div className="ad-modal" style={{ maxWidth: 360 }} onClick={(e) => e.stopPropagation()}>
              <p style={{ fontWeight: 600, marginTop: 0 }}>Delete this order?</p>
              <p className="order-modal-hint">This cannot be undone.</p>
              <div className="order-modal-actions" style={{ justifyContent: "flex-end", gap: 8 }}>
                <button type="button" className="button sheet-reset" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="order-modal-delete"
                  disabled={deleting}
                  onClick={() => void remove()}
                >
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}