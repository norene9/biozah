import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ?.trim()
  .replace(/^['"]|['"]$/g, "")
  .replace(/\\n/g, "\n")
  .replace(/\r\n/g, "\n");

export function getFirebaseAdminApp() {
  if (!projectId || !clientEmail || !privateKey) return null;
  if (!privateKey.includes("-----BEGIN PRIVATE KEY-----") || !privateKey.includes("-----END PRIVATE KEY-----")) {
    throw new Error("FIREBASE_PRIVATE_KEY must be the PEM private key from a Firebase service-account JSON file.");
  }
  const app = getApps().length ? getApps()[0] : initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  return app;
}

export function getFirebaseAdminAuth() {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  return getAuth(app);
}

export function isAdminEmail(email: string | undefined) {
  const allowlist = (process.env.ADMIN_EMAILS ?? "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
  const defaultEmail = process.env.DEFAULT_ADMIN_EMAIL?.trim().toLowerCase();
  if (defaultEmail) allowlist.push(defaultEmail);
  return Boolean(email && allowlist.includes(email.toLowerCase()));
}

export async function ensureDefaultAdmin() {
  const email = process.env.DEFAULT_ADMIN_EMAIL?.trim();
  const password = process.env.DEFAULT_ADMIN_PASSWORD;
  const auth = getFirebaseAdminAuth();
  if (!auth || !email || !password) return { status: "skipped" as const };
  if (password.length < 6) throw new Error("DEFAULT_ADMIN_PASSWORD must be at least 6 characters.");
  try {
    await auth.getUserByEmail(email);
    return { status: "exists" as const };
  } catch (error) {
    const authError = error as { code?: string };
    if (authError.code === "auth/configuration-not-found") {
      throw new Error(`Firebase Authentication is not enabled for project ${projectId ?? "(unknown)"}. Enable Authentication and Email/Password sign-in in the Firebase Console.`);
    }
    if (authError.code !== "auth/user-not-found") throw error;
    await auth.createUser({ email, password, emailVerified: true, disabled: false });
    return { status: "created" as const };
  }
}

export async function getAdminUserFromCookie(cookieValue: string | undefined) {
  if (!cookieValue) return null;
  const auth = getFirebaseAdminAuth();
  if (!auth) return null;
  try {
    const decoded = await auth.verifySessionCookie(cookieValue, true);
    return isAdminEmail(decoded.email) ? decoded : null;
  } catch {
    return null;
  }
}
