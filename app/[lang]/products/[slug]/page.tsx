import { notFound } from "next/navigation";
import { getCategoryName, getProductBySlug } from "@/lib/store";
import { AddToCart } from "@/components/add-to-cart";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

import "./product-detail.css";

const LOW_STOCK = 5;

export default async function ProductPage({ params }: { params: Promise<{ slug: string; lang: string }> }) {
  const { slug, lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const categoryName = await getCategoryName(product.category_id);
  const soldOut = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= LOW_STOCK;

  return (
    <main className="product-page">
      <div className="product-detail">
        <div className="detail-image">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} />
          ) : (
            <span className="detail-image-placeholder" aria-hidden="true">
              {product.name.charAt(0).toUpperCase()}
            </span>
          )}
          {soldOut && <span className="detail-chip">{dict.product.soldOut}</span>}
        </div>

        <div className="detail-copy">
          {categoryName && <p className="eyebrow">{categoryName}</p>}
          <h1>{product.name}</h1>
          <p className="price">
            {product.price.toLocaleString()} {product.currency}
          </p>

          {product.description && <p className="description">{product.description}</p>}

          <p className={`availability ${soldOut ? "is-out" : lowStock ? "is-low" : ""}`}>
            {soldOut
              ? dict.product.currentlyUnavailable
              : lowStock
                ? dict.product.onlyLeft.replace("{count}", String(product.stock))
                : dict.product.available.replace("{count}", String(product.stock))}
          </p>

          <AddToCart product={product} dict={dict.product} />
        </div>
      </div>
    </main>
  );
}
