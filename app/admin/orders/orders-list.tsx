"use client";

import { useEffect, useState } from "react";
import type { StoredOrder, StoredOrderItem } from "@/types/store";

const statuses = ["Pending", "Confirmed", "Preparing", "Shipped", "Delivered", "Cancelled"];
type AdminOrder = StoredOrder & { items: StoredOrderItem[] };

export function OrdersList() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [message, setMessage] = useState("Loading orders...");
  useEffect(() => { fetch("/api/admin/orders").then(async (response) => { const result = await response.json(); if (!response.ok) throw new Error(result.error); setOrders(result.orders); setMessage(result.orders.length ? "" : "No orders yet."); }).catch((error) => setMessage(error instanceof Error ? error.message : "Orders are temporarily unavailable.")); }, []);
  async function update(orderId: string, status: string) { const response = await fetch("/api/admin/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId, status }) }); if (!response.ok) { setMessage("Unable to update order status."); return; } setOrders((current) => current.map((order) => order.order_id === orderId ? { ...order, status } : order)); }
  if (!orders.length) return <p className="admin-message">{message}</p>;
  return <div className="admin-list">{orders.map((order) => <article key={order.order_id}><div><p className="eyebrow">{order.order_id} · {new Date(order.created_at).toLocaleDateString()}</p><h2>{order.customer_name}</h2><p>{order.email} · {order.total.toLocaleString()} DZD · {order.wilaya}</p><details className="order-details"><summary>View details</summary><p>{order.phone} · {order.commune}<br />{order.address}<br />{order.delivery_method} · {order.payment_method}</p><ul>{order.items.map((item) => <li key={item.product_id}>{item.product_name} x{item.quantity} · {item.subtotal.toLocaleString()} DZD</li>)}</ul></details></div><label className="status-select"><span>Status</span><select value={order.status} onChange={(event) => void update(order.order_id, event.target.value)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label></article>)}</div>;
}
