import { redirect } from "next/navigation";
import { getFirestoreCategories, getFirestoreProducts, getFirestoreOrders } from "@/lib/firestore";
import { getCurrentAdmin } from "@/lib/firebase/server";
import { ManagementConsole } from "@/components/admin/management-console";

export const dynamic = "force-dynamic"; // this page reads live Firestore data; never statically cache it

export default async function AdminDashboardPage() {
  if (!(await getCurrentAdmin())) redirect("/admin/login");

  const [categories, products, orders] = await Promise.all([
    getFirestoreCategories(),
    getFirestoreProducts(),
    getFirestoreOrders(),
  ]);

  return (
    <ManagementConsole
      initialProducts={products}
      initialCategories={categories}
      initialOrders={orders}
    />
  );
}
