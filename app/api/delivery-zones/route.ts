// Save as: app/api/delivery-zones/route.ts
// Public, read-only — no getCurrentAdmin() check. Only returns active zones and only the
// fields checkout needs (no created_at/id internals leaking, though these are harmless).
import { NextResponse } from "next/server";
import { getDeliveryZones } from "@/lib/firebase/delivery";

export async function GET() {
  try {
    const zones = (await getDeliveryZones()).filter((zone) => zone.active);
    return NextResponse.json(
      zones.map((zone) => ({
        wilayaCode: zone.wilayaCode,
        wilayaName: zone.wilayaName,
        homeDeliveryPrice: zone.homeDeliveryPrice,
        deskDeliveryPrice: zone.deskDeliveryPrice,
      })),
    );
  } catch {
    return NextResponse.json({ error: "Unable to load delivery options." }, { status: 502 });
  }
}
