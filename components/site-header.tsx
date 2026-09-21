"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { useCart } from "./cart-provider";
import { firebaseAuth } from "@/lib/firebase/client";

export function SiteHeader({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count } = useCart();

  async function logout() {
    try {
      await fetch("/api/auth/session", { method: "DELETE", credentials: "same-origin" });
    } finally {
      try {
        await signOut(firebaseAuth);
      } finally {
        window.location.replace("/admin/login");
      }
    }
  }

  if (isAdmin && pathname.startsWith("/admin")) {
    return (
      <>
        <aside className="admin-sidebar">
          <Link href="/admin" className="admin-sidebar-brand">
            <span className="brand-mark">b</span>
            <span>biozah</span>
          </Link>
          <nav className="admin-sidebar-nav" aria-label="Admin navigation">
            <Link className={pathname === "/admin" ? "active" : ""} href="/admin">
              Dashboard
            </Link>
            <Link
              className={
                pathname.startsWith("/admin/products") || pathname.startsWith("/admin/categories")
                  ? "active"
                  : ""
              }
              href="/admin/products"
            >
              Products &amp; Collections
            </Link>
            <Link
              className={pathname.startsWith("/admin/orders") ? "active" : ""}
              href="/admin/orders"
            >
              Orders
            </Link>
          </nav>
          <button className="admin-sidebar-signout" type="button" onClick={() => void logout()}>
            Sign out
          </button>
        </aside>
        <header className="admin-mobile-header">
          <Link href="/admin" className="brand">
            <span className="brand-mark">b</span>
            <span>biozah</span>
          </Link>
          <button
            type="button"
            className="menu-button"
            aria-label="Toggle admin navigation"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            ☰
          </button>
          {mobileOpen && (
            <nav className="admin-mobile-nav">
              <Link href="/admin">Dashboard</Link>
              <Link href="/admin/products">Products &amp; Collections</Link>
              <Link href="/admin/orders">Orders</Link>
              <button type="button" onClick={() => void logout()}>
                Sign out
              </button>
            </nav>
          )}
        </header>
      </>
    );
  }

  return (
    <header className="site-header user-header">
      <button
        className="menu-button user-menu-button"
        aria-label="Toggle menu"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        ☰
      </button>
      <Link href="/" className="brand">
        <span className="brand-mark">b</span>
        <span>biozah</span>
      </Link>
      <nav className={mobileOpen ? "nav open" : "nav"}>
        <Link href="/">Home</Link>
        <Link href="/products">Shop</Link>
        <Link href="/categories">Collections</Link>
      </nav>
      <Link href="/cart" className="cart-link user-bag" aria-label={`Shopping bag, ${count} items`}>
        <span aria-hidden="true">♧</span>
        <b>{count}</b>
      </Link>
    </header>
  );
}
