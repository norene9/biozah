"use client";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "./cart-provider";
import { signOut } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";

export function SiteHeader({ isAdmin = false }: { isAdmin?: boolean }) {
  const [open, setOpen] = useState(false); const { count } = useCart();
  async function logout() { await fetch("/api/auth/session", { method: "DELETE" }); await signOut(firebaseAuth); window.location.href = "/admin/login"; }
  return <header className="site-header"><Link href="/" className="brand" onClick={() => setOpen(false)}><span className="brand-mark">b</span><span>biozah</span></Link><button className="menu-button" aria-label="Toggle menu" onClick={() => setOpen(!open)}>☰</button><nav className={open ? "nav open" : "nav"}><Link href="/" onClick={() => setOpen(false)}>Home</Link><Link href="/products" onClick={() => setOpen(false)}>Shop</Link><Link href="/categories" onClick={() => setOpen(false)}>Collections</Link>{isAdmin ? <div className="settings-menu"><button type="button" className="settings-trigger" onClick={() => setOpen(!open)}>Settings <span aria-hidden="true">⌄</span></button>{open && <div className="settings-dropdown"><Link href="/admin" onClick={() => setOpen(false)}>Dashboard</Link><Link href="/admin/products" onClick={() => setOpen(false)}>Products</Link><Link href="/admin/categories" onClick={() => setOpen(false)}>Collections</Link><Link href="/admin/orders" onClick={() => setOpen(false)}>Orders</Link><Link href="/admin/settings" onClick={() => setOpen(false)}>Firebase data</Link><button type="button" onClick={() => void logout}>Sign out</button></div>}</div> : <Link href="/admin/login" className="admin-link" onClick={() => setOpen(false)}>Admin</Link>}<Link href="/cart" className="cart-link" onClick={() => setOpen(false)}>Bag <span>{count}</span></Link></nav></header>;
}
