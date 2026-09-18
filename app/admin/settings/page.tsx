import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/firebase/server";

export default async function AdminSettingsPage() {
  if (!(await getCurrentAdmin())) redirect("/admin/login");
  return <main className="settings-page"><div className="settings-container"><header className="settings-page-header"><p className="eyebrow">Admin settings</p><h1>Settings.</h1><p>Firebase stores catalogue data and orders. Cloudinary stores product images; Firebase Authentication protects this workspace.</p></header><section className="settings-panel"><h2>Firebase data</h2><p className="settings-status"><i aria-hidden="true" /> Firestore connected through the server</p><p className="settings-help">Products, categories, and orders are stored in Firestore using server-side Firebase Admin access. No database credentials are sent to the browser.</p><div className="settings-instructions"><p className="eyebrow">Collections</p><p><strong>products</strong> stores catalogue fields, prices, stock, active state, and Cloudinary references. <strong>categories</strong> stores collections. <strong>orders</strong> stores customer details, totals, status, and immutable order items.</p></div></section></div></main>;
}
