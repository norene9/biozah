"use client";

import Link from "next/link";

import { useCart } from "@/components/cart-provider";
import "@/app/cart/cart.css";
export default function CartPage() {
  const { items, remove, setQuantity, subtotal } = useCart();

  const delivery = items.length ? 600 : 0;
  const total = subtotal + delivery;

  return (
    <main className="cart-page">
      {/* PAGE HEADER */}
      <section className="cart-hero">
        <p className="cart-eyebrow">Your selection</p>

        <h1>Your bag.</h1>

        <p className="cart-description">
          A thoughtful selection for your daily ritual.
        </p>
      </section>

      {/* EMPTY CART */}
      {!items.length ? (
        <section className="cart-empty">
          <div className="cart-empty-inner">
            <span className="cart-empty-mark">○</span>

            <h2>Your bag is waiting.</h2>

            <p>
              Take a look around and add something that feels good.
            </p>

            <Link href="/products" className="cart-button">
              Continue shopping
              <span>↗</span>
            </Link>
          </div>
        </section>
      ) : (
        /* CART */
        <section className="cart-content">
          {/* ITEMS */}
          <div className="cart-items-section">
            <div className="cart-section-header">
              <span>Products</span>
              <span>
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            </div>

            <div className="cart-items">
              {items.map(({ product, quantity }) => (
                <article className="cart-item" key={product.id}>
                  <div
                    className="cart-thumb"
                    style={{
                      backgroundImage: `url(${product.image_url})`,
                    }}
                  />

                  <div className="cart-item-info">
                    <p className="cart-product-name">
                      {product.name}
                    </p>

                    <p className="cart-product-price">
                      {product.price.toLocaleString()}{" "}
                      {product.currency}
                    </p>

                    <div className="cart-item-bottom">
                      <div className="quantity-control">
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(product.id, quantity - 1)
                          }
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>

                        <span>{quantity}</span>

                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(product.id, quantity + 1)
                          }
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        className="cart-remove"
                        onClick={() => remove(product.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* SUMMARY */}
          <aside className="cart-summary">
            <p className="cart-summary-eyebrow">
              Order summary
            </p>

            <h2>Your order</h2>

            <div className="summary-lines">
              <div>
                <span>Subtotal</span>
                <span>{subtotal.toLocaleString()} DZD</span>
              </div>

              <div>
                <span>Delivery</span>
                <span>{delivery.toLocaleString()} DZD</span>
              </div>
            </div>

            <div className="summary-total">
              <span>Total</span>

              <strong>
                {total.toLocaleString()} DZD
              </strong>
            </div>

            <Link href="/checkout" className="checkout-button">
              Checkout
              <span>↗</span>
            </Link>

            <Link href="/products" className="continue-shopping">
              Continue shopping
            </Link>
          </aside>
        </section>
      )}
    </main>
  );
}
