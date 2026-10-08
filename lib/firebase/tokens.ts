import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getFirebaseAdminApp } from "@/lib/firebase/admin";
import crypto from "crypto";

function db() {
  const app = getFirebaseAdminApp();
  if (!app) throw new Error("Firebase Admin is not configured.");
  return getFirestore(app);
}

export async function createEmailVerificationToken(userId: string, newEmail: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24; // 24 hours

  await db().collection("email_verification_tokens").doc(token).set({
    userId,
    newEmail,
    expiresAt,
    created_at: FieldValue.serverTimestamp(),
  });

  return token;
}

export async function createPasswordResetToken(email: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + 1000 * 60 * 60; // 1 hour

  await db().collection("password_reset_tokens").doc(token).set({
    email,
    expiresAt,
    created_at: FieldValue.serverTimestamp(),
  });

  return token;
}

export async function verifyEmailToken(token: string) {
  const docRef = db().collection("email_verification_tokens").doc(token);
  const snap = await docRef.get();

  if (!snap.exists) return null;
  const data = snap.data()!;

  if (Date.now() > data.expiresAt) {
    await docRef.delete();
    return null;
  }

  await docRef.delete();
  return { userId: data.userId as string, newEmail: data.newEmail as string };
}