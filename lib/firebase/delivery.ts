import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getFirebaseAdminApp } from "@/lib/firebase/admin";

export type DeliveryZone = {
  id: string;
  wilayaCode: string;
  wilayaName: string;
  homeDeliveryPrice: number;
  deskDeliveryPrice: number;
  active: boolean;
};

function db() {
  const app = getFirebaseAdminApp();
  if (!app) throw new Error("Firebase Admin is not configured.");
  return getFirestore(app);
}

function zoneFrom(id: string, data: FirebaseFirestore.DocumentData): DeliveryZone {
  return {
    id,
    wilayaCode: String(data.wilayaCode ?? ""),
    wilayaName: String(data.wilayaName ?? ""),
    homeDeliveryPrice: Number(data.homeDeliveryPrice) || 0,
    deskDeliveryPrice: Number(data.deskDeliveryPrice) || 0,
    active: data.active !== false,
  };
}

export async function getDeliveryZones(): Promise<DeliveryZone[]> {
  const snapshot = await db().collection("delivery_zones").orderBy("wilayaCode").get();
  return snapshot.docs.map((doc) => zoneFrom(doc.id, doc.data()));
}

export async function getDeliveryZoneById(id: string) {
  const snapshot = await db().collection("delivery_zones").doc(id).get();
  return snapshot.exists ? zoneFrom(snapshot.id, snapshot.data()!) : undefined;
}

export async function getDeliveryZoneByWilayaCode(wilayaCode: string) {
  const snapshot = await db()
    .collection("delivery_zones")
    .where("wilayaCode", "==", wilayaCode)
    .limit(1)
    .get();
  const doc = snapshot.docs[0];
  return doc ? zoneFrom(doc.id, doc.data()) : undefined;
}

export async function createDeliveryZone(zone: Omit<DeliveryZone, "id"> & { id?: string }) {
  const ref = zone.id
    ? db().collection("delivery_zones").doc(zone.id)
    : db().collection("delivery_zones").doc();
  await ref.set({ ...zone, created_at: FieldValue.serverTimestamp(), updated_at: FieldValue.serverTimestamp() });
  return ref.id;
}

export async function updateDeliveryZone(id: string, updates: Partial<Omit<DeliveryZone, "id" | "wilayaCode">>) {
  await db()
    .collection("delivery_zones")
    .doc(id)
    .set({ ...updates, updated_at: FieldValue.serverTimestamp() }, { merge: true });
}

export async function deleteDeliveryZone(id: string) {
  await db().collection("delivery_zones").doc(id).delete();
}