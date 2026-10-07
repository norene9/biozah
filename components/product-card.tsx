import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/store";
import { getCategoryName } from "@/lib/store";
import { AddToBagButton } from "./add-to-bag-button";
import { discountPercent, finalPrice, hasDiscount } from "@/lib/pricing";
import { localePath } from "@/lib/i18n/locale-path";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import "./product-card.css";

const LOW_STOCK_THRESHOLD = 5;

export async function ProductCard({
  product,
  locale,
  dict,
}: {
  product: Product;
  locale: Locale;
  dict: Dictionary["product"];
}) {
  const href = localePath(locale, `/products/${product.slug}`);
  const categoryName = await getCategoryName(product.category_id);
  const soldOut = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD;
  const onSale = hasDiscount(product);

  return (
    <article className="pcard">
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
        {onSale && !soldOut && <span className="pcard-chip pcard-chip--sale">-{discountPercent(product)}%</span>}
        {soldOut && <span className="pcard-chip">{dict.soldOut}</span>}
        {lowStock && <span className="pcard-chip pcard-chip--warn">{dict.onlyLeft.replace("{count}", String(product.stock))}</span>}
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
            {onSale && (
              <s className="pcard-old-price">
                {product.price.toLocaleString("en-US")} {product.currency}
              </s>
            )}
            <span>
              {finalPrice(product).toLocaleString("en-US")} {product.currency}
            </span>
          </p>
          <AddToBagButton product={product} dict={dict} />
        </div>
      </div>
    </article>
  );
}

