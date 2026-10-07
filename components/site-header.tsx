"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { useCart } from "./cart-provider";
import { firebaseAuth } from "@/lib/firebase/client";
import { SearchBar } from "./search-bar";
import { LanguageSwitcher } from "./language-switcher";
import { localePath } from "@/lib/i18n/locale-path";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import Image from "next/image";
import "./site-header.css";

export function SiteHeader({
  isAdmin = false,
  locale,
  dict,
}: {
  isAdmin?: boolean;
  locale: Locale;
  dict: Dictionary["header"];
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count } = useCart();

  // Pathname without the locale prefix: "/en/admin/settings" -> "/admin/settings"
  const path = pathname.replace(new RegExp(`^/${locale}`), "") || "/";

  async function logout() {
    try {
      await fetch("/api/auth/session", { method: "DELETE", credentials: "same-origin" });
    } finally {
      try {
        await signOut(firebaseAuth);
      } finally {
        window.location.replace(localePath(locale, "/admin/login"));
      }
    }
  }

  if (isAdmin && path.startsWith("/admin")) {
    return (
      <>
        <aside className="admin-sidebar">
          <Link href={localePath(locale, "/admin")} className="brand">
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
            <Link className={path === "/admin" ? "active" : ""} href={localePath(locale, "/admin")}>
              {dict.dashboard}
            </Link>
            <Link
              className={path === "/admin/settings/delivery" ? "active" : ""}
              href={localePath(locale, "/admin/settings/delivery")}
            >
              {dict.deliverySettings}
            </Link>
            <Link
              className={path === "/admin/settings" ? "active" : ""}
              href={localePath(locale, "/admin/settings")}
            >
              {dict.settings}
            </Link>
          </nav>
          <div className="admin-sidebar-footer">
            <LanguageSwitcher />
            <button className="admin-sidebar-signout" type="button" onClick={() => void logout()}>
              {dict.signOut}
            </button>
          </div>
        </aside>
        <header className="admin-mobile-header">
          <Link href={localePath(locale, "/admin")} className="brand">
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
              <Link href={localePath(locale, "/admin")}>{dict.dashboard}</Link>
              <Link href={localePath(locale, "/admin/settings/delivery")}>{dict.deliverySettings}</Link>
              <Link href={localePath(locale, "/admin/settings")}>{dict.settings}</Link>
              <LanguageSwitcher />
              <button type="button" onClick={() => void logout()}>
                {dict.signOut}
              </button>
            </nav>
          )}
        </header>
      </>
    );
  }

  return (
    <header className="site-header user-header">
      <Link href={localePath(locale, "/")} className="brand">
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
        <Link href={localePath(locale, "/")}>{dict.home}</Link>
        <Link href={localePath(locale, "/products")} className={path === "/products" ? "active" : ""}>
          {dict.shop}
        </Link>
        <Link href={localePath(locale, "/categories")}>{dict.collections}</Link>
        <Link href={localePath(locale, "/about")}>{dict.about}</Link>
      </nav>

      <div className="header-actions">
        <SearchBar label={dict.search} placeholder={dict.searchPlaceholder} />
        <LanguageSwitcher />

        <Link
          href={localePath(locale, "/cart")}
          className="cart-link user-bag"
          aria-label={`${dict.cart}, ${count}`}
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
          <span>{dict.cart} ({count})</span>
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
