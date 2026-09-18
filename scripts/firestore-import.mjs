import fs from "node:fs/promises";
import process from "node:process";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const inputPath = process.argv[2];
if (!inputPath) throw new Error("Usage: node scripts/firestore-import.mjs migration/firestore-export.json [--overwrite]");
const overwrite = process.argv.includes("--overwrite");
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim().replace(/^['"]|['"]$/g, "").replace(/\\n/g, "\n");
if (!projectId || !clientEmail || !privateKey) throw new Error("Firebase Admin environment variables are required.");
const app = getApps().length ? getApps()[0] : initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
const db = getFirestore(app);
const source = JSON.parse(await fs.readFile(inputPath, "utf8"));
const orderItems = Array.isArray(source.orderItems) ? source.orderItems : [];
for (const collection of ["categories", "products", "orders"]) {
  for (const record of Array.isArray(source[collection]) ? source[collection] : []) {
    const id = String(record.id ?? record.order_id ?? "").trim();
    if (!id) throw new Error(`${collection} record is missing id/order_id.`);
    const ref = db.collection(collection).doc(id);
    const existing = await ref.get();
    if (existing.exists && !overwrite) { console.log(`Skipped existing ${collection}/${id}`); continue; }
    const data = { ...record, updated_at: FieldValue.serverTimestamp(), created_at: record.created_at ?? FieldValue.serverTimestamp() };
    delete data.id;
    if (collection === "orders" && !data.items) data.items = orderItems.filter((item) => item.order_id === id);
    await ref.set(data, { merge: true });
    console.log(`${existing.exists ? "Updated" : "Imported"} ${collection}/${id}`);
  }
}
console.log("Import complete. No source data was deleted.");