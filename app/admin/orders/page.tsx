import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/firebase/server";
import { OrdersManager } from "./orders-manager";

export default async function AdminOrdersPage() {
  if (!(await getCurrentAdmin())) redirect("/admin/login");
  return <main className="admin-page"><div className="admin-container"><header className="admin-page-header"><div><p className="eyebrow">Operations</p><h1>Orders.</h1><p>Review customer orders and move each one through fulfillment.</p></div></header><OrdersManager /></div></main>;
}
