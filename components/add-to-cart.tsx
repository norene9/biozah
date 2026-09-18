"use client";
import type { Product } from "@/types/store";
import { useCart } from "./cart-provider";
export function AddToCart({ product }: { product: Product }) { const { add } = useCart(); return <button className="button button-dark" disabled={!product.stock} onClick={() => add(product)}>{product.stock ? "Add to bag" : "Currently unavailable"}</button>; }
