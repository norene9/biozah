import { FieldValue, getFirestore, Timestamp } from "firebase-admin/firestore";
import { getFirebaseAdminApp } from "@/lib/firebase/admin";
import { optimizedCloudinaryUrl } from "@/lib/cloudinary";
import type { Category, Product, StoredOrder, StoredOrderItem } from "@/types/store";

const STORE_SETTINGS_DOC = "settings/store";
function db() {
  const app = getFirebaseAdminApp();
  if (!app) throw new Error("Firebase Admin is not configured.");
  return getFirestore(app);
}

function iso(value: unknown) {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return typeof value === "string" ? value : new Date().toISOString();
}

function categoryFrom(id: string, data: FirebaseFirestore.DocumentData): Category {
  return {
    id,
    name: String(data.name ?? ""),
    slug: String(data.slug ?? ""),
    description: String(data.description ?? ""),
    image_url: String(data.image_url ?? ""),
    image_public_id: data.image_public_id ? String(data.image_public_id) : undefined,
    active: data.active !== false,
  };
}

function productFrom(id: string, data: FirebaseFirestore.DocumentData): Product {
  const publicId = data.image_public_id ? String(data.image_public_id) : "";
  return {
    id,
    name: String(data.name ?? ""),
    slug: String(data.slug ?? ""),
    description: String(data.description ?? ""),
    category_id: String(data.category_id ?? ""),
    price: Number(data.price) || 0,
    currency: String(data.currency ?? "DZD"),
    image_url: publicId ? optimizedCloudinaryUrl(publicId) : String(data.image_url ?? ""),
    image_public_id: publicId || undefined,
    stock: Number(data.stock) || 0,
    active: data.active !== false,
    featured: data.featured === true,
  };
}

export async function getFirestoreCategories() {
  const snapshot = await db().collection("categories").get();
  return snapshot.docs.map((doc) => categoryFrom(doc.id, doc.data()));
}
export async function getFirestoreProducts() {
  const snapshot = await db().collection("products").get();
  return snapshot.docs.map((doc) => productFrom(doc.id, doc.data()));
}
export async function getFirestoreProductById(id: string) {
  const snapshot = await db().collection("products").doc(id).get();
  return snapshot.exists ? productFrom(snapshot.id, snapshot.data()!) : undefined;
}
export async function getFirestoreCategoryById(id: string) {
  const snapshot = await db().collection("categories").doc(id).get();
  return snapshot.exists ? categoryFrom(snapshot.id, snapshot.data()!) : undefined;
}
export async function getFirestoreProductBySlug(slug: string) {
  const snapshot = await db()
    .collection("products")
    .where("slug", "==", slug)
    .where("active", "==", true)
    .limit(1)
    .get();
  const doc = snapshot.docs[0];
  return doc ? productFrom(doc.id, doc.data()) : undefined;
}
export async function getFirestoreCategoryBySlug(slug: string) {
  const snapshot = await db()
    .collection("categories")
    .where("slug", "==", slug)
    .where("active", "==", true)
    .limit(1)
    .get();
  const doc = snapshot.docs[0];
  return doc ? categoryFrom(doc.id, doc.data()) : undefined;
}
export async function getFirestoreProductsByCategory(categoryId: string) {
  const snapshot = await db()
    .collection("products")
    .where("category_id", "==", categoryId)
    .where("active", "==", true)
    .get();
  return snapshot.docs.map((doc) => productFrom(doc.id, doc.data()));
}

export async function createFirestoreCategory(category: Omit<Category, "id"> & { id?: string }) {
  const ref = category.id
    ? db().collection("categories").doc(category.id)
    : db().collection("categories").doc();
  await ref.set({
    ...category,
    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp(),
  });
  return ref.id;
}
export async function updateFirestoreCategory(id: string, updates: Partial<Omit<Category, "id">>) {
  await db()
    .collection("categories")
    .doc(id)
    .set({ ...updates, updated_at: FieldValue.serverTimestamp() }, { merge: true });
}
export async function deleteFirestoreCategory(id: string) {
  await db().collection("categories").doc(id).delete();
}
export async function updateFirestoreProduct(id: string, updates: Partial<Omit<Product, "id">>) {
  await db()
    .collection("products")
    .doc(id)
    .set({ ...updates, updated_at: FieldValue.serverTimestamp() }, { merge: true });
}
export async function createFirestoreProduct(product: Omit<Product, "id"> & { id?: string }) {
  const ref = product.id
    ? db().collection("products").doc(product.id)
    : db().collection("products").doc();
  await ref.set({
    ...product,
    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp(),
  });
  return ref.id;
}
export async function deleteFirestoreProduct(id: string) {
  await db().collection("products").doc(id).delete();
}

export async function createFirestoreOrder(
  order: Omit<StoredOrder, "created_at"> & { created_at?: string },
) {
  const ref = db().collection("orders").doc(order.order_id);
  await ref.set({
    ...order,
    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp(),
  });
  return ref.id;
}
export async function getFirestoreOrders(): Promise<StoredOrder[]> {
  const snapshot = await db().collection("orders").orderBy("created_at", "desc").get();
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      order_id: doc.id,
      created_at: iso(data.created_at),
      customer_name: String(data.customer_name ?? ""),
      email: String(data.email ?? ""),
      phone: String(data.phone ?? ""),
      wilaya: String(data.wilaya ?? ""),
      commune: String(data.commune ?? ""),
      address: String(data.address ?? ""),
      delivery_method: String(data.delivery_method ?? ""),
      payment_method: String(data.payment_method ?? ""),
      subtotal: Number(data.subtotal) || 0,
      delivery_cost: Number(data.delivery_cost) || 0,
      total: Number(data.total) || 0,
      status: String(data.status ?? "Pending"),
      items: Array.isArray(data.items) ? (data.items as StoredOrderItem[]) : [],
    };
  });
}
export async function updateFirestoreOrderStatus(id: string, status: string) {
  await db()
    .collection("orders")
    .doc(id)
    .set({ status, updated_at: FieldValue.serverTimestamp() }, { merge: true });
}
export async function getFirestoreStoreSettings() {
  const snap = await db().doc(STORE_SETTINGS_DOC).get(); // TODO: `db` = whatever your category functions call it
  if (!snap.exists) return { contactEmail: "", contactPhone: "", bio: "" };
  const data = snap.data() ?? {};
  return {
    contactEmail: data.contactEmail ?? "",
    contactPhone: data.contactPhone ?? "",
    bio: data.bio ?? "",
  };
}

export async function updateFirestoreStoreSettings(settings: { contactEmail: string; contactPhone: string; bio: string }) {
  await db().doc(STORE_SETTINGS_DOC).set({ ...settings, updated_at: FieldValue.serverTimestamp()}, { merge: true });
}
