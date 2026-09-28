// Save as: lib/delivery.ts
// Public read used at checkout — separate from the admin CRUD in lib/firebase/delivery.ts
// so checkout only imports what it needs (no create/update/delete exposed to that code path).
import { getDeliveryZoneByWilayaCode } from "@/lib/firebase/delivery";

export async function getDeliveryPrice(
  wilayaCode: string,
  method: "home" | "desk",
): Promise<number | null> {
  const zone = await getDeliveryZoneByWilayaCode(wilayaCode);
  if (!zone || !zone.active) return null; // null = not deliverable / zone disabled
  return method === "home" ? zone.homeDeliveryPrice : zone.deskDeliveryPrice;
}
