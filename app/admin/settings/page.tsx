// Save as: app/admin/settings/page.tsx
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/firebase/server";
import { getFirestoreStoreSettings } from "@/lib/firestore";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const footerSettings = await getFirestoreStoreSettings();

  return (
    <>
      <section className="ad-page-head">
        <div>
          <h1>Store settings.</h1>
          <p>Your account details and footer information.</p>
        </div>
      </section>
      <SettingsForm adminEmail={admin.email ?? ""} footerSettings={footerSettings} />
    </>
  );
}
