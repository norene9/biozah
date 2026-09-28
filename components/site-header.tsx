"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { useCart } from "./cart-provider";
import { firebaseAuth } from "@/lib/firebase/client";
import { SearchBar } from "./search-bar";
import Image from "next/image";
import "./site-header.css";

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
          <Link href="/admin" className="brand">
            <Image
              src="/logo.jpg"
              alt="biozah"
              width={36}
              height={36}
              className="brand-logo"
              priority
            />
            <span className="brand-name">biozah</span>
          </Link>
          <nav className="admin-sidebar-nav" aria-label="Admin navigation">
            <Link className={pathname === "/admin" ? "active" : ""} href="/admin">
              Dashboard
            </Link>
            <Link
              className={pathname === "/admin/settings/delivery" ? "active" : ""}
              href="/admin/settings/delivery"
            >
              Delivery Settings
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
            <Image
              src="/logo.jpg"
              alt="biozah"
              width={36}
              height={36}
              className="brand-logo"
              priority
            />
            <span className="brand-name">biozah</span>
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
              <Link href="/admin/settings/delivery">Delivery Settings</Link>
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
        <Image
          src="/logo.jpg"
          alt="biozah"
          width={36}
          height={36}
          className="brand-logo"
          priority
        />
        <span className="brand-name">biozah</span>
      </Link>
      <nav className={mobileOpen ? "nav open" : "nav"} aria-label="Main navigation">
        <Link href="/">Home</Link>
        <Link href="/products" className={pathname === "/products" ? "active" : ""}>
          Shop
        </Link>
        <Link href="/categories">Collections</Link>
        <Link href="/about">About Us</Link>
      </nav>

      <div className="header-actions">
        <SearchBar />

        <Link
          href="/cart"
          className="cart-link user-bag"
          aria-label={`Shopping bag, ${count} items`}
        >
          <span className="cart-icon" aria-hidden="true">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="18" cy="21" r="1" />
              <path d="M2.5 3h2l2.6 12.4a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21.5 7H6" />
            </svg>
          </span>
          <span>Cart ({count})</span>
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
