import { redirect } from "next/navigation";
import { getCategories, getProducts } from "@/lib/store";
import { getCurrentAdmin } from "@/lib/firebase/server";
import { ManagementConsole } from "@/components/admin/management-console";

export default async function AdminDashboardPage() {
  if (!(await getCurrentAdmin())) redirect("/admin/login");

  const [categories, products] = await Promise.all([getCategories(), getProducts()]);

  return (
    <ManagementConsole
      initialProducts={products}
      initialCategories={categories}
      initialOrders={[]}
    />
  );
}