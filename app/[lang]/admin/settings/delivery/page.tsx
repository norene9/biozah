// Save as: app/admin/settings/delivery/page.tsx
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/firebase/server";
import { getDeliveryZones } from "@/lib/firebase/delivery";
import { DeliveryZonesTable } from "@/components/admin/delivery-zones-table";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";

export default async function DeliveryZonesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!(await getCurrentAdmin())) redirect(`/${lang}/admin/login`);
  const dict = await getDictionary(lang as Locale);
  const zones = await getDeliveryZones();

  return (
    <>
      <section className="ad-page-head">
        <div>
          <h1>{dict.admin.deliveryTitle}</h1>
          <p>{dict.admin.deliverySub}</p>
        </div>
      </section>
      <DeliveryZonesTable initialZones={zones} />
    </>
  );
}
