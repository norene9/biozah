"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/site-header";

export function LayoutShell({
  children,
  isAdmin,
}: {
  children: React.ReactNode;
  isAdmin: boolean;
}) {
  const pathname = usePathname();

  const isLoginPage = pathname === "/admin/login";

  return (
    <>
      {!isLoginPage && <SiteHeader isAdmin={isAdmin} />}
      {children}
    </>
  );
}