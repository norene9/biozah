import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/firebase/server";
import { getFirestoreStoreSettings, updateFirestoreStoreSettings } from "@/lib/firestore";

export async function GET() {
  if (!(await getCurrentAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try { const settings = await getFirestoreStoreSettings(); return NextResponse.json(settings); } catch { return NextResponse.json({ error: "Unable to load store settings." }, { status: 502 }); }
}

export async function PATCH(request: Request) {
  if (!(await getCurrentAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const body = (await request.json()) as { contactEmail?: string; contactPhone?: string };
  // Only touch fields actually provided — never overwrite existing settings with empty strings.
  const updates: { contactEmail?: string; contactPhone?: string } = {};
  if (body.contactEmail !== undefined) updates.contactEmail = body.contactEmail.trim();
  if (body.contactPhone !== undefined) updates.contactPhone = body.contactPhone.trim();
  try { await updateFirestoreStoreSettings(updates); return NextResponse.json({ ok: true }); } catch { return NextResponse.json({ error: "Unable to save store settings." }, { status: 502 }); }
}
