"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { useCart } from "./cart-provider";
import { firebaseAuth } from "@/lib/firebase/client";
import "./site-header.css"
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
            <Link className={pathname === "/admin/settings" ? "active" : ""} href="/admin/settings">
              Settings
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
              <Link href="/admin/settings">Settings</Link>
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
    <Link href="/" className="brand">
      <span className="brand-name">biozah</span>
    </Link>

    <nav
      className={mobileOpen ? "nav open" : "nav"}
      aria-label="Main navigation"
    >
      <Link
        href="/products"
        className={pathname === "/products" ? "active" : ""}
      >
        Shop
      </Link>

      <Link href="/">Home</Link>

      <Link href="/categories">Collections</Link>

      <Link href="/about">
        About Us
      </Link>
    </nav>

    <div className="header-actions">
      <button
        type="button"
        className="search-button"
        aria-label="Search"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4.5 4.5" />
        </svg>

        <span>Search</span>
      </button>

      <Link
        href="/cart"
        className="cart-link user-bag"
        aria-label={`Shopping bag, ${count} items`}
      >
        <span>Cart ({count})</span>

        <span className="cart-icon" aria-hidden="true">
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M5 8h14l-1 12H6L5 8Z" />
            <path d="M9 8a3 3 0 0 1 6 0" />
          </svg>
        </span>
      </Link>
    </div>

    <button
      type="button"
      className="menu-button user-menu-button"
      aria-label="Toggle menu"
      aria-expanded={mobileOpen}
      onClick={() => setMobileOpen(!mobileOpen)}
    >
      <span />
      <span />
    </button>
  </header>
);
}
