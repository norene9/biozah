import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getFirebaseAdminApp } from "@/lib/firebase/admin";
import { verifyEmailToken } from "@/lib/firebase/tokens";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/admin/login?error=InvalidToken", request.url));
  }

  const result = await verifyEmailToken(token);
  if (!result) {
    return NextResponse.redirect(new URL("/admin/login?error=TokenExpiredOrInvalid", request.url));
  }

  const app = getFirebaseAdminApp();
  if (!app) {
    return NextResponse.redirect(new URL("/admin/login?error=ServerError", request.url));
  }

  await getAuth(app).updateUser(result.userId, {
    email: result.newEmail,
    emailVerified: true,
  });

  return NextResponse.redirect(new URL("/admin/login?message=EmailUpdated", request.url));
}