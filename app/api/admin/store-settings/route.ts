import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/firebase/server";
import { getAuth } from "firebase-admin/auth";
// TODO: import whatever initializes your Admin SDK app elsewhere (e.g. the same one
// getCurrentAdmin uses internally in lib/firebase/server.ts) instead of calling getAuth()
// bare here — it needs an initialized App passed in, or a default app already initialized.

export async function PATCH(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const body = await request.json() as { email?: string; currentPassword?: string; newPassword?: string };
  const email = body.email?.trim();
  if (body.newPassword && !body.currentPassword) return NextResponse.json({ error: "Current password is required to set a new one." }, { status: 400 });
  if (body.newPassword && body.newPassword.length < 8) return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
  const updates: { email?: string; password?: string } = {};
  if (email && email !== admin.email) updates.email = email;
  if (body.newPassword) updates.password = body.newPassword;
  if (Object.keys(updates).length === 0) return NextResponse.json({ ok: true });
  try { await getAuth().updateUser(admin.uid, updates); return NextResponse.json({ ok: true }); } catch (error) { const code = (error as { code?: string })?.code; return NextResponse.json({ error: code === "auth/email-already-exists" ? "That email is already in use." : "Unable to update account." }, { status: 400 }); }
}

