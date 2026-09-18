import Link from "next/link";
import type { Product } from "@/types/store";
import { getCategoryName } from "@/lib/store";

export async function ProductCard({ product }: { product: Product }) { return <article className="product-card"><Link href={`/products/${product.slug}`} className="product-image" style={{ backgroundImage: `url(${product.image_url})` }} aria-label={`View ${product.name}`}><span>{product.stock === 0 ? "Sold out" : "Shop"}</span></Link><div className="product-info"><p className="eyebrow">{await getCategoryName(product.category_id)}</p><Link href={`/products/${product.slug}`}><h3>{product.name}</h3></Link><p className="price">{product.price.toLocaleString()} {product.currency}</p></div></article>; }
