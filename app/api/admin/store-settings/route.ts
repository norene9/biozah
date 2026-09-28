// Save as: app/api/admin/store-settings/route.ts
import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/firebase/server";
import { getFirestoreStoreSettings, updateFirestoreStoreSettings } from "@/lib/firestore";
import type { StoreSettings } from "@/types/store";

export async function GET() {
  if (!(await getCurrentAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    return NextResponse.json(await getFirestoreStoreSettings());
  } catch {
    return NextResponse.json({ error: "Unable to load store settings." }, { status: 502 });
  }
}

export async function PATCH(request: Request) {
  if (!(await getCurrentAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const body = (await request.json()) as Partial<StoreSettings>;
  try {
    await updateFirestoreStoreSettings({
      businessName: body.businessName?.trim() ?? "",
      tagline: body.tagline?.trim() ?? "",
      address: body.address?.trim() ?? "",
      contactEmail: body.contactEmail?.trim() ?? "",
      contactPhone: body.contactPhone?.trim() ?? "",
      instagramUrl: body.instagramUrl?.trim() ?? "",
      facebookUrl: body.facebookUrl?.trim() ?? "",
      tiktokUrl: body.tiktokUrl?.trim() ?? "",
      copyrightText: body.copyrightText?.trim() ?? "",
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to save store settings." }, { status: 502 });
  }
}
