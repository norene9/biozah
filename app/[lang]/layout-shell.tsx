"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

export function LayoutShell({
  children,
  isAdmin,
  locale,
  dict,
}: {
  children: React.ReactNode;
  isAdmin: boolean;
  locale: Locale;
  dict: Dictionary["header"];
}) {
  const pathname = usePathname();

  // Paths are locale-prefixed: /en/admin/login, /ar/admin/login, ...
  const isLoginPage = pathname.endsWith("/admin/login");

  return (
    <>
      {!isLoginPage && <SiteHeader isAdmin={isAdmin} locale={locale} dict={dict} />}
      {children}
    </>
  );
}