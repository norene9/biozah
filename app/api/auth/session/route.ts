import { NextResponse } from "next/server";
import { getFirebaseAdminAuth, isAdminEmail } from "@/lib/firebase/admin";

const sessionDuration = 1000 * 60 * 60 * 24 * 5;

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json() as { idToken?: string };
    if (!idToken) return NextResponse.json({ error: "Missing sign-in token." }, { status: 400 });
    const auth = getFirebaseAdminAuth();
    if (!auth) return NextResponse.json({ error: "Firebase admin authentication is not configured." }, { status: 503 });
    const decoded = await auth.verifyIdToken(idToken);
    if (!isAdminEmail(decoded.email)) return NextResponse.json({ error: "This account is not an administrator." }, { status: 403 });
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: sessionDuration });
    const response = NextResponse.json({ ok: true });
    response.cookies.set("biozah-admin-session", sessionCookie, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: sessionDuration / 1000, path: "/" });
    return response;
  } catch {
    return NextResponse.json({ error: "Unable to create an admin session." }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("biozah-admin-session", "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", expires: new Date(0), maxAge: 0, path: "/" });
  return response;
}
