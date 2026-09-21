"use client";

import { FormEvent, useState } from "react";
import { useCart } from "@/components/cart-provider";
import "./checkout.css"
export default function CheckoutPage() {
  const { items, subtotal } = useCart();

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setBusy(true);
    setError("");

    const data = Object.fromEntries(
      new FormData(event.currentTarget)
    );

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        items: items.map(({ product, quantity }) => ({
          product_id: product.id,
          quantity,
        })),
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      setError(
        result.error ?? "We could not create your order."
      );

      setBusy(false);
      return;
    }

    window.location.href =
      `/order-confirmed?order=${result.order_id}`;
  }

  if (!items.length) {
    return (
      <main className="checkout-page">
        <section className="checkout-empty">
          <p className="checkout-eyebrow">Checkout</p>

          <h1>Your bag is empty.</h1>

          <p>
            Add products before heading to checkout.
          </p>

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
      {/* HEADER */}
      <section className="checkout-hero">
        <p className="checkout-eyebrow">
          Almost there
        </p>

        <h1>Let&apos;s get it to you.</h1>

        <p className="checkout-description">
          Complete your details and we&apos;ll take care of
          the rest.
        </p>
      </section>

      <section className="checkout-layout">
        {/* FORM */}
        <form
          className="checkout-form"
          onSubmit={submit}
        >
          <div className="checkout-form-section">
            <div className="form-section-heading">
              <span>01</span>

              <h2>Delivery details</h2>
            </div>

            <div className="form-fields">
              <label>
                <span>Full name</span>

                <input
                  name="customer_name"
                  required
                  autoComplete="name"
                />
              </label>

              <label>
                <span>Email</span>

                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                />
              </label>

              <label>
                <span>Phone</span>

                <input
                  name="phone"
                  required
                  autoComplete="tel"
                />
              </label>

              <div className="form-row">
                <label>
                  <span>Wilaya</span>

                  <input
                    name="wilaya"
                    required
                  />
                </label>

                <label>
                  <span>Commune</span>

                  <input
                    name="commune"
                    required
                  />
                </label>
              </div>

              <label>
                <span>Full address</span>

                <textarea
                  name="address"
                  required
                  rows={4}
                />
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
                  name="delivery_method"
                  defaultValue="home"
                >
                  <option value="home">
                    Home delivery · 600 DZD
                  </option>

                  <option value="pickup">
                    Office / pickup point · 350 DZD
                  </option>
                </select>
              </label>

              <label>
                <span>Payment method</span>

                <select
                  name="payment_method"
                  defaultValue="cash"
                >
                  <option value="cash">
                    Cash on delivery
                  </option>

                  <option value="transfer">
                    Bank transfer
                  </option>
                </select>
              </label>
            </div>
          </div>

          {error && (
            <p className="checkout-error">
              {error}
            </p>
          )}

          <button
            className="place-order-button"
            disabled={busy}
            type="submit"
          >
            {busy ? (
              "Placing order..."
            ) : (
              <>
                Place order
                <span>↗</span>
              </>
            )}
          </button>
        </form>

        {/* SUMMARY */}
        <aside className="checkout-summary">
          <p className="summary-eyebrow">
            Your selection
          </p>

          <h2>Order summary</h2>

          <div className="checkout-products">
            {items.map(({ product, quantity }) => (
              <div
                className="checkout-product"
                key={product.id}
              >
                <div
                  className="checkout-product-image"
                  style={{
                    backgroundImage:
                      `url(${product.image_url})`,
                  }}
                />

                <div>
                  <p>{product.name}</p>

                  <span>
                    {quantity} ×{" "}
                    {product.price.toLocaleString()}{" "}
                    {product.currency}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="checkout-summary-lines">
            <div>
              <span>Items</span>

              <span>
                {subtotal.toLocaleString()} DZD
              </span>
            </div>

            <div>
              <span>Delivery</span>

              <span>600 DZD</span>
            </div>
          </div>

          <div className="checkout-total">
            <span>Total</span>

            <strong>
              {(subtotal + 600).toLocaleString()} DZD
            </strong>
          </div>
        </aside>
      </section>
    </main>
  );
}
