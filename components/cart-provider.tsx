"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { CartItem, Product } from "@/types/store";

type CartContextValue = { items: CartItem[]; add: (product: Product) => void; remove: (id: string) => void; setQuantity: (id: string, quantity: number) => void; count: number; subtotal: number };
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => { const saved = window.localStorage.getItem("biozah-cart"); if (saved) setItems(JSON.parse(saved)); }, []);
  useEffect(() => { window.localStorage.setItem("biozah-cart", JSON.stringify(items)); }, [items]);
  const add = (product: Product) => setItems((current) => { const found = current.find((item) => item.product.id === product.id); return found ? current.map((item) => item.product.id === product.id ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } : item) : [...current, { product, quantity: 1 }]; });
  const remove = (id: string) => setItems((current) => current.filter((item) => item.product.id !== id));
  const setQuantity = (id: string, quantity: number) => quantity <= 0 ? remove(id) : setItems((current) => current.map((item) => item.product.id === id ? { ...item, quantity: Math.min(quantity, item.product.stock) } : item));
  return <CartContext.Provider value={{ items, add, remove, setQuantity, count: items.reduce((sum, item) => sum + item.quantity, 0), subtotal: items.reduce((sum, item) => sum + item.quantity * item.product.price, 0) }}>{children}</CartContext.Provider>;
}
export function useCart() { const context = useContext(CartContext); if (!context) throw new Error("useCart must be used inside CartProvider"); return context; }
