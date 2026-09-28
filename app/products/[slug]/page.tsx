import { notFound } from "next/navigation";
import { getCategoryName, getProductBySlug } from "@/lib/store";
import { AddToCart } from "@/components/add-to-cart";

import "./product-detail.css";

const LOW_STOCK = 5;

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
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
          {soldOut && <span className="detail-chip">Sold out</span>}
        </div>

        <div className="detail-copy">
          {categoryName && <p className="eyebrow">{categoryName}</p>}
          <h1>{product.name}</h1>
          <p className="price">
            {product.price.toLocaleString()} {product.currency}
          </p>

          {product.description && <p className="description">{product.description}</p>}

          <p className={`availability ${soldOut ? "is-out" : lowStock ? "is-low" : ""}`}>
            {soldOut ? "Currently unavailable" : lowStock ? `Only ${product.stock} left` : `${product.stock} available`}
          </p>

          <AddToCart product={product} />
        </div>
      </div>
    </main>
  );
}
