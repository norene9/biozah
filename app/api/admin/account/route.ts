import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/firebase/server";
import { getFirestoreStoreSettings, updateFirestoreStoreSettings } from "@/lib/firestore";

export async function GET() {
  if (!(await getCurrentAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try { const settings = await getFirestoreStoreSettings(); return NextResponse.json(settings); } catch { return NextResponse.json({ error: "Unable to load store settings." }, { status: 502 }); }
}

export async function PATCH(request: Request) {
  if (!(await getCurrentAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const body = await request.json() as { contactEmail?: string; contactPhone?: string; bio?: string };
  try { await updateFirestoreStoreSettings({ contactEmail: body.contactEmail?.trim() ?? "", contactPhone: body.contactPhone?.trim() ?? "", bio: body.bio?.trim() ?? "" }); return NextResponse.json({ ok: true }); } catch { return NextResponse.json({ error: "Unable to save store settings." }, { status: 502 }); }
}
