import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getFirebaseAdminApp } from "@/lib/firebase/admin";

function db() {
  const app = getFirebaseAdminApp();
  if (!app) throw new Error("Firebase Admin is not configured.");
  return getFirestore(app);
}

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Token and new password are required." }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long." }, { status: 400 });
    }

    // Look up token in Firestore
    const tokenRef = db().collection("password_reset_tokens").doc(token);
    const snap = await tokenRef.get();

    if (!snap.exists) {
      return NextResponse.json({ error: "Invalid or expired password reset link." }, { status: 400 });
    }

    const data = snap.data()!;
    if (Date.now() > data.expiresAt) {
      await tokenRef.delete();
      return NextResponse.json({ error: "Password reset link has expired. Please request a new one." }, { status: 400 });
    }

    // Find the user by email and update password
    const app = getFirebaseAdminApp();
    const auth = getAuth(app!);
    const user = await auth.getUserByEmail(data.email as string);

    await auth.updateUser(user.uid, { password: newPassword });

    // Invalidate the token so it cannot be reused
    await tokenRef.delete();

    return NextResponse.json({ ok: true, message: "Password updated successfully." });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Unable to reset password." }, { status: 500 });
  }
}