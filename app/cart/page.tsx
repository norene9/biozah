"use client";
import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import "./cart.css";

export default function CartPage() {
  const { items, remove, setQuantity, subtotal } = useCart();

    // Calculate total discount savings across all items based on discount_percent
    const totalDiscount = items.reduce((acc, { product, quantity }) => {
      if (product.discount_percent && product.discount_percent > 0) {
        const savingsPerUnit = product.price * (product.discount_percent / 100);
        return acc + savingsPerUnit * quantity;
      }
      return acc;
    }, 0);

    
    const total = subtotal - totalDiscount;

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
              {items.map(({ product, quantity }) => {
                const discountPercent = product.discount_percent ?? 0;
                const hasDiscount = discountPercent > 0;

                // product.price is the original list price
                const originalPrice = product.price;
                const discountedPrice = hasDiscount
                  ? originalPrice * (1 - discountPercent / 100)
                  : originalPrice;

                return (
                  <article className="cart-item" key={product.id}>
                    <div
                      className="cart-thumb"
                      style={{
                        backgroundImage: `url(${product.image_url})`,
                      }}
                    >
                      {hasDiscount && (
                        <span className="cart-discount-badge">
                          -{discountPercent}%
                        </span>
                      )}
                    </div>

                    <div className="cart-item-info">
                      <div>
                        <p className="cart-product-name">{product.name}</p>

                        <div className="cart-product-price-wrapper">
                          <span className="cart-product-price">
                            {discountedPrice.toLocaleString()} {product.currency}
                          </span>
                          {hasDiscount && (
                            <span className="cart-product-original-price">
                              {originalPrice.toLocaleString()} {product.currency}
                            </span>
                          )}
                        </div>
                      </div>

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
                );
              })}
            </div>
          </div>

          {/* SUMMARY */}
          <aside className="cart-summary">
            <p className="cart-summary-eyebrow">Order summary</p>
            <h2>Your order</h2>

            <div className="summary-lines">
              <div>
                <span>Subtotal</span>
                <span>{subtotal.toLocaleString()} DZD</span>
              </div>

              {totalDiscount > 0 && (
                <div className="summary-discount-line">
                  <span>Savings</span>
                  <span>-{totalDiscount.toLocaleString()} DZD</span>
                </div>
              )}
 
            </div>

            <div className="summary-total">
              <span>Total</span>
              <strong>{total.toLocaleString()} DZD</strong>
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