import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/store";
import { getCategoryName } from "@/lib/store";
import { AddToBagButton } from "./add-to-bag-button";
import "./product-card.css";

const LOW_STOCK_THRESHOLD = 5;

export async function ProductCard({ product }: { product: Product }) {
  const href = `/products/${product.slug}`;
  const categoryName = await getCategoryName(product.category_id);
  const soldOut = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD;

  return (
    
    <article className="pcard">
        {/* <Link
        href={`/products/${product.slug}`}
        className="product-image"
        style={{ backgroundImage: `url(${product.image_url})` }}
        aria-label={`View ${product.name}`}
      >
        <span>{product.stock === 0 ? "Sold out" : "Shop"}</span>
      </Link> */}
      <Link href={href} className="pcard-media" aria-label={`View ${product.name}`}>
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt=""
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="pcard-img"
          />
        ) : (
          <span className="pcard-placeholder" aria-hidden="true">
            {product.name.charAt(0).toUpperCase()}
          </span>
        )}
        {soldOut && <span className="pcard-chip">Sold out</span>}
        {lowStock && <span className="pcard-chip pcard-chip--warn">Only {product.stock} left</span>}
      </Link>

      <div className="pcard-body">
        <div>
          {categoryName && <p className="pcard-category">{categoryName}</p>}
          <h3 className="pcard-name">
            <Link href={href}>{product.name}</Link>
          </h3>
        </div>
        <div className="pcard-footer">
          <p className="pcard-price">
            {product.price.toLocaleString("en-US")} {product.currency}
          </p>
          <AddToBagButton product={product} />
        </div>
      </div>
    </article>
  );
}

