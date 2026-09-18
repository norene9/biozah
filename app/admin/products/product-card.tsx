"use client";

import type { Product } from "@/types/store";
import { StockBadge } from "./stock-badge";

export function ProductCard({ product, categoryName, onEdit, onToggle }: { product: Product; categoryName: string; onEdit: () => void; onToggle: (active: boolean) => void }) { return <article className="product-mobile-card"><div className="product-mobile-top"><div className="product-thumb">{product.image_url && <img src={product.image_url} alt="" />}</div><div><p className="eyebrow">{categoryName}</p><h3>{product.name}</h3><p className="product-slug">/{product.slug}</p><strong>{product.price.toLocaleString()} {product.currency}</strong><StockBadge stock={product.stock} /></div></div><div className="product-mobile-actions"><label className="toggle-label"><input type="checkbox" checked={product.active} onChange={(event) => onToggle(event.target.checked)} /><span /> Active</label><button className="button sheet-reset" type="button" onClick={onEdit}>Edit</button></div></article>; }
