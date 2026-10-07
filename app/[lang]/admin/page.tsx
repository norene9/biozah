import { redirect } from "next/navigation";
import { getFirestoreCategories, getFirestoreProducts, getFirestoreOrders } from "@/lib/firestore";
import { getCurrentAdmin } from "@/lib/firebase/server";
import { ManagementConsole } from "@/components/admin/management-console";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

export const dynamic = "force-dynamic"; // this page reads live Firestore data; never statically cache it

export default async function AdminDashboardPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!(await getCurrentAdmin())) redirect(`/${lang}/admin/login`);
  const dict = await getDictionary(lang as Locale);

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
  dict={dict.admin}
  formsDict={dict.forms}
  ordersDict={dict.orders} // 👈 Pass dict.orders here
/>
  );
}
