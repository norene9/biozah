import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/firebase/server";
import { getFirestoreStoreSettings, updateFirestoreStoreSettings } from "@/lib/firestore";
import type { StoreSettings } from "@/types/store";

export async function GET() {
  if (!(await getCurrentAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  try {
    const settings = await getFirestoreStoreSettings();
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: "Unable to load store settings." }, { status: 502 });
  }
}

export async function PATCH(request: Request) {
  if (!(await getCurrentAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Partial<StoreSettings>;

    const updates: Partial<StoreSettings> = {};
    if (body.businessName !== undefined) updates.businessName = body.businessName.trim();
    if (body.tagline !== undefined) updates.tagline = body.tagline.trim();
    if (body.address !== undefined) updates.address = body.address.trim();
    if (body.contactEmail !== undefined) updates.contactEmail = body.contactEmail.trim();
    if (body.contactPhone !== undefined) updates.contactPhone = body.contactPhone.trim();
    if (body.instagramUrl !== undefined) updates.instagramUrl = body.instagramUrl.trim();
    if (body.facebookUrl !== undefined) updates.facebookUrl = body.facebookUrl.trim();
    if (body.tiktokUrl !== undefined) updates.tiktokUrl = body.tiktokUrl.trim();
    if (body.copyrightText !== undefined) updates.copyrightText = body.copyrightText.trim();

    await updateFirestoreStoreSettings(updates);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to save store settings." }, { status: 502 });
  }
}
