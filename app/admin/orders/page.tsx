import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/firebase/server";
import { OrdersList } from "./orders-list";

export default async function AdminOrdersPage() {
  if (!(await getCurrentAdmin())) redirect("/admin/login");
  return <main><section className="page-intro"><p className="eyebrow">Operations</p><h1>Orders.</h1><p>Review customer orders and move each one through fulfillment.</p></section><OrdersList /></main>;
}
