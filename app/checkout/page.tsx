"use client";

import { FormEvent, useEffect, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { finalPrice, hasDiscount } from "@/lib/pricing";
import "./checkout.css";

type Zone = {
  wilayaCode: string;
  wilayaName: string;
  homeDeliveryPrice: number;
  deskDeliveryPrice: number;
};

export default function CheckoutPage() {
  const { items, clear } = useCart();
  const [zones, setZones] = useState<Zone[]>([]);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [wilayaCode, setWilayaCode] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"home" | "pickup">("home");

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/delivery-zones")
      .then((res) => res.json())
      .then((data: Zone[]) => {
        setZones(data);
        if (data.length > 0) setWilayaCode(data[0].wilayaCode);
      })
      .catch(() => setError("Unable to load delivery options. Please refresh."))
      .finally(() => setZonesLoading(false));
  }, []);

  const selectedZone = zones.find((zone) => zone.wilayaCode === wilayaCode);
  const deliveryPrice = selectedZone
    ? deliveryMethod === "home"
      ? selectedZone.homeDeliveryPrice
      : selectedZone.deskDeliveryPrice
    : 0;

  const itemsTotal = items.reduce(
    (sum, { product, quantity }) => sum + finalPrice(product) * quantity,
    0,
  );
  const regularTotal = items.reduce(
    (sum, { product, quantity }) => sum + product.price * quantity,
    0,
  );
  const savings = regularTotal - itemsTotal;
  const total = itemsTotal + deliveryPrice;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedZone) {
      setError("Please choose a wilaya.");
      return;
    }

    setBusy(true);
    setError("");

    const data = Object.fromEntries(new FormData(event.currentTarget));

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        wilaya: selectedZone.wilayaName,
        wilaya_code: selectedZone.wilayaCode,
        delivery_method: deliveryMethod,
        items: items.map(({ product, quantity }) => ({ product_id: product.id, quantity })),
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      setError(result.error ?? "We could not create your order.");
      setBusy(false);
      return;
    }

    clear();
    window.location.href = `/order-confirmed?order=${result.order_id}`;
  }

  if (!items.length) {
    return (
      <main className="checkout-page">
        <section className="checkout-empty">
          <p className="checkout-eyebrow">Checkout</p>
          <h1>Your bag is empty.</h1>
          <p>Add products before heading to checkout.</p>
          <a href="/products" className="checkout-button">
            Continue shopping
            <span>↗</span>
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <section className="checkout-hero">
        <p className="checkout-eyebrow">Almost there</p>
        <h1>Let&apos;s get it to you.</h1>
        <p className="checkout-description">
          Complete your details and we&apos;ll take care of the rest.
        </p>
      </section>

      <section className="checkout-layout">
        <form className="checkout-form" onSubmit={submit}>
          <div className="checkout-form-section">
            <div className="form-section-heading">
              <span>01</span>
              <h2>Delivery details</h2>
            </div>

            <div className="form-fields">
              <label>
                <span>Full name</span>
                <input name="customer_name" required autoComplete="name" />
              </label>

              <label>
                <span>Email</span>
                <input name="email" type="email" required autoComplete="email" />
              </label>

              <label>
                <span>Phone</span>
                <input name="phone" required autoComplete="tel" />
              </label>

              <div className="form-row">
                <label>
                  <span>Wilaya</span>
                  <select
                    value={wilayaCode}
                    onChange={(event) => setWilayaCode(event.target.value)}
                    required
                    disabled={zonesLoading || zones.length === 0}
                  >
                    {zonesLoading && <option value="">Loading…</option>}
                    {!zonesLoading && zones.length === 0 && (
                      <option value="">No delivery zones available</option>
                    )}
                    {zones.map((zone) => (
                      <option key={zone.wilayaCode} value={zone.wilayaCode}>
                        {zone.wilayaCode} — {zone.wilayaName}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Commune</span>
                  <input name="commune" required />
                </label>
              </div>

              <label>
                <span>Full address</span>
                <textarea name="address" required rows={4} />
              </label>
            </div>
          </div>

          <div className="checkout-form-section">
            <div className="form-section-heading">
              <span>02</span>
              <h2>Delivery &amp; payment</h2>
            </div>

            <div className="form-fields">
              <label>
                <span>Delivery method</span>
                <select
                  value={deliveryMethod}
                  onChange={(event) =>
                    setDeliveryMethod(event.target.value as "home" | "pickup")
                  }
                  disabled={!selectedZone}
                >
                  <option value="home">
                    Home delivery
                    {selectedZone
                      ? ` · ${selectedZone.homeDeliveryPrice.toLocaleString()} DZD`
                      : ""}
                  </option>
                  <option value="pickup">
                    Stop desk / pickup
                    {selectedZone
                      ? ` · ${selectedZone.deskDeliveryPrice.toLocaleString()} DZD`
                      : ""}
                  </option>
                </select>
              </label>

              <label>
                <span>Payment method</span>
                <select name="payment_method" defaultValue="cash">
                  <option value="cash">Cash on delivery</option>
                  <option value="transfer">Bank transfer</option>
                </select>
              </label>
            </div>
          </div>

          {error && <p className="checkout-error">{error}</p>}

          <button
            className="place-order-button"
            disabled={busy || !selectedZone}
            type="submit"
          >
            {busy ? (
              "Placing order..."
            ) : (
              <>
                <span>Place order</span>
                <span className="place-order-total">
                  {total.toLocaleString()} DZD
                </span>
                <span>↗</span>
              </>
            )}
          </button>
        </form>

        <aside className="checkout-summary">
          <div className="summary-products-box">
            <p className="summary-eyebrow">Your selection</p>
            <h2>Order summary</h2>

            <div className="checkout-products">
              {items.map(({ product, quantity }) => (
                <div className="checkout-product" key={product.id}>
                  <div
                    className="checkout-product-image"
                    style={{ backgroundImage: `url(${product.image_url})` }}
                  />
                  <div>
                    <p>{product.name}</p>
                    <span>
                      {quantity} ×{" "}
                      {hasDiscount(product) && (
                        <s className="checkout-old-price">
                          {product.price.toLocaleString()}
                        </s>
                      )}{" "}
                      {finalPrice(product).toLocaleString()} {product.currency}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="summary-totals-box">
            <div className="checkout-summary-lines">
              <div>
                <span>Items</span>
                <span>{itemsTotal.toLocaleString()} DZD</span>
              </div>
              {savings > 0 && (
                <div className="checkout-savings">
                  <span>You save</span>
                  <span>−{savings.toLocaleString()} DZD</span>
                </div>
              )}
              <div>
                <span>Delivery</span>
                <span>
                  {selectedZone ? `${deliveryPrice.toLocaleString()} DZD` : "—"}
                </span>
              </div>
            </div>

            <div className="checkout-total">
              <span>Total</span>
              <strong>{total.toLocaleString()} DZD</strong>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}