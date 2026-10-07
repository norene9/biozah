// Save as: app/admin/settings/page.tsx
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/firebase/server";
import { getFirestoreStoreSettings } from "@/lib/firestore";
import { SettingsForm } from "@/components/admin/settings-form";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const admin = await getCurrentAdmin();
  if (!admin) redirect(`/${lang}/admin/login`);
  const dict = await getDictionary(lang as Locale);

  const footerSettings = await getFirestoreStoreSettings();

  return (
    <>
      <section className="ad-page-head">
        <div>
          <h1>{dict.admin.settingsTitle}</h1>
          <p>{dict.admin.settingsSub}</p>
        </div>
      </section>
      <SettingsForm adminEmail={admin.email ?? ""} footerSettings={footerSettings} />
    </>
  );
}
