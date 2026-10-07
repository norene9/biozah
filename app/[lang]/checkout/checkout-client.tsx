"use client";

import { FormEvent, useEffect, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { finalPrice, hasDiscount } from "@/lib/pricing";
import { localePath } from "@/lib/i18n/locale-path";
import { useLocale } from "@/lib/i18n/use-locale";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import "./checkout.css";

type Zone = {
  wilayaCode: string;
  wilayaName: string;
  homeDeliveryPrice: number;
  deskDeliveryPrice: number;
};

export function CheckoutClient({ dict }: { dict: Dictionary["checkout"] }) {
  const { items, clear } = useCart();
  const locale = useLocale();
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
      .catch(() => setError(dict.zonesError))
      .finally(() => setZonesLoading(false));
  }, [dict.zonesError]);

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
      setError(dict.chooseWilaya);
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
      setError(result.error ?? dict.orderError);
      setBusy(false);
      return;
    }

    clear();
    window.location.href = `${localePath(locale, "/order-confirmed")}?order=${result.order_id}`;
  }

  if (!items.length) {
    return (
      <main className="checkout-page">
        <section className="checkout-empty">
          <p className="checkout-eyebrow">{dict.emptyEyebrow}</p>
          <h1>{dict.emptyTitle}</h1>
          <p>{dict.emptyText}</p>
          <a href={localePath(locale, "/products")} className="checkout-button">
            {dict.continueShopping}
            <span>↗</span>
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <section className="checkout-hero">
        <p className="checkout-eyebrow">{dict.heroEyebrow}</p>
        <h1>{dict.heroTitle}</h1>
        <p className="checkout-description">
          {dict.heroSubtitle}
        </p>
      </section>

      <section className="checkout-layout">
        <form className="checkout-form" onSubmit={submit}>
          <div className="checkout-form-section">
            <div className="form-section-heading">
              <span>01</span>
              <h2>{dict.deliveryDetails}</h2>
            </div>

            <div className="form-fields">
              <label>
                <span>{dict.fullName}</span>
                <input name="customer_name" required autoComplete="name" />
              </label>

              <label>
                <span>{dict.email}</span>
                <input name="email" type="email" required autoComplete="email" />
              </label>

              <label>
                <span>{dict.phone}</span>
                <input name="phone" required autoComplete="tel" />
              </label>

              <div className="form-row">
                <label>
                  <span>{dict.wilaya}</span>
                  <select
                    value={wilayaCode}
                    onChange={(event) => setWilayaCode(event.target.value)}
                    required
                    disabled={zonesLoading || zones.length === 0}
                  >
                    {zonesLoading && <option value="">{dict.loading}</option>}
                    {!zonesLoading && zones.length === 0 && (
                      <option value="">{dict.noZones}</option>
                    )}
                    {zones.map((zone) => (
                      <option key={zone.wilayaCode} value={zone.wilayaCode}>
                        {zone.wilayaCode} — {zone.wilayaName}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>{dict.commune}</span>
                  <input name="commune" required />
                </label>
              </div>

              <label>
                <span>{dict.fullAddress}</span>
                <textarea name="address" required rows={4} />
              </label>
            </div>
          </div>

          <div className="checkout-form-section">
            <div className="form-section-heading">
              <span>02</span>
              <h2>{dict.deliveryPayment}</h2>
            </div>

            <div className="form-fields">
              <label>
                <span>{dict.deliveryMethod}</span>
                <select
                  value={deliveryMethod}
                  onChange={(event) =>
                    setDeliveryMethod(event.target.value as "home" | "pickup")
                  }
                  disabled={!selectedZone}
                >
                  <option value="home">
                    {dict.homeDelivery}
                    {selectedZone
                      ? ` · ${selectedZone.homeDeliveryPrice.toLocaleString()} DZD`
                      : ""}
                  </option>
                  <option value="pickup">
                    {dict.pickup}
                    {selectedZone
                      ? ` · ${selectedZone.deskDeliveryPrice.toLocaleString()} DZD`
                      : ""}
                  </option>
                </select>
              </label>

              <label>
                <span>{dict.paymentMethod}</span>
                <select name="payment_method" defaultValue="cash">
                  <option value="cash">{dict.cash}</option>
                  <option value="transfer">{dict.transfer}</option>
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
              dict.placing
            ) : (
              <>
                <span>{dict.placeOrder}</span>
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
            <p className="summary-eyebrow">{dict.summaryEyebrow}</p>
            <h2>{dict.summaryTitle}</h2>

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
                <span>{dict.items}</span>
                <span>{itemsTotal.toLocaleString()} DZD</span>
              </div>
              {savings > 0 && (
                <div className="checkout-savings">
                  <span>{dict.youSave}</span>
                  <span>−{savings.toLocaleString()} DZD</span>
                </div>
              )}
              <div>
                <span>{dict.delivery}</span>
                <span>
                  {selectedZone ? `${deliveryPrice.toLocaleString()} DZD` : "—"}
                </span>
              </div>
            </div>

            <div className="checkout-total">
              <span>{dict.total}</span>
              <strong>{total.toLocaleString()} DZD</strong>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
