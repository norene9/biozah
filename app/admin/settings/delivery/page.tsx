// Save as: app/admin/settings/delivery/page.tsx
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/firebase/server";
import { getDeliveryZones } from "@/lib/firebase/delivery";
import { DeliveryZonesTable } from "@/components/admin/delivery-zones-table";

export const dynamic = "force-dynamic";

export default async function DeliveryZonesPage() {
  if (!(await getCurrentAdmin())) redirect("/admin/login");
  const zones = await getDeliveryZones();

  return (
    <>
      <section className="ad-page-head">
        <div>
          <h1>Delivery zones.</h1>
          <p>Set home and stop-desk prices for each wilaya.</p>
        </div>
      </section>
      <DeliveryZonesTable initialZones={zones} />
    </>
  );
}
