"use client";
import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { localePath } from "@/lib/i18n/locale-path";
import { useLocale } from "@/lib/i18n/use-locale";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import "./cart.css";

export function CartClient({ dict }: { dict: Dictionary["cart"] }) {
  const { items, remove, setQuantity, subtotal } = useCart();
  const locale = useLocale();

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
        <p className="cart-eyebrow">{dict.eyebrow}</p>
        <h1>{dict.title}</h1>
        <p className="cart-description">
          {dict.description}
        </p>
      </section>

      {/* EMPTY CART */}
      {!items.length ? (
        <section className="cart-empty">
          <div className="cart-empty-inner">
            <span className="cart-empty-mark">○</span>
            <h2>{dict.emptyTitle}</h2>
            <p>
              {dict.emptyText}
            </p>
            <Link href={localePath(locale, "/products")} className="cart-button">
              {dict.continueShopping}
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
              <span>{dict.productsLabel}</span>
              <span>
                {items.length} {items.length === 1 ? dict.itemLabel : dict.itemsLabel}
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
                          {dict.remove}
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
            <p className="cart-summary-eyebrow">{dict.summaryEyebrow}</p>
            <h2>{dict.summaryTitle}</h2>

            <div className="summary-lines">
              <div>
                <span>{dict.subtotal}</span>
                <span>{subtotal.toLocaleString()} DZD</span>
              </div>

              {totalDiscount > 0 && (
                <div className="summary-discount-line">
                  <span>{dict.savings}</span>
                  <span>-{totalDiscount.toLocaleString()} DZD</span>
                </div>
              )}

            </div>

            <div className="summary-total">
              <span>{dict.total}</span>
              <strong>{total.toLocaleString()} DZD</strong>
            </div>

            <Link href={localePath(locale, "/checkout")} className="checkout-button">
              {dict.checkout}
              <span>↗</span>
            </Link>

            <Link href={localePath(locale, "/products")} className="continue-shopping">
              {dict.continueShopping}
            </Link>
          </aside>
        </section>
      )}
    </main>
  );
}
