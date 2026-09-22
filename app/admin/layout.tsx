// Save as: app/admin/layout.tsx
// Wraps every /admin/* route with your existing SiteHeader (isAdmin sidebar).
// The login page should redirect BEFORE reaching here, or check pathname === "/admin/login"
// inside this layout if you want the sidebar hidden there too.
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import "./admin-console.css";

export const metadata = {
  title: "biozah — Admin",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader isAdmin />
      <main className="ad-shell">
        <div className="ad-shell-inner">{children}</div>
      </main>
    </>
  );
}
