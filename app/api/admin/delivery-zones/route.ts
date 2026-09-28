// Save as: app/api/admin/delivery-zones/route.ts
import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/firebase/server";
import {
  createDeliveryZone,
  deleteDeliveryZone,
  getDeliveryZones,
  updateDeliveryZone,
} from "@/lib/firebase/delivery";

export async function GET() {
  if (!(await getCurrentAdmin()))
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    return NextResponse.json(await getDeliveryZones());
  } catch {
    return NextResponse.json({ error: "Unable to load delivery zones." }, { status: 502 });
  }
}

export async function POST(request: Request) {
  if (!(await getCurrentAdmin()))
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const body = (await request.json()) as {
    wilayaCode?: string;
    wilayaName?: string;
    homeDeliveryPrice?: number;
    deskDeliveryPrice?: number;
  };
  if (!body.wilayaCode || !body.wilayaName)
    return NextResponse.json({ error: "Wilaya code and name are required." }, { status: 400 });
  try {
    await createDeliveryZone({
      wilayaCode: body.wilayaCode,
      wilayaName: body.wilayaName,
      homeDeliveryPrice: Number(body.homeDeliveryPrice) || 0,
      deskDeliveryPrice: Number(body.deskDeliveryPrice) || 0,
      active: true,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to create zone." }, { status: 502 });
  }
}

export async function PATCH(request: Request) {
  if (!(await getCurrentAdmin()))
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const body = (await request.json()) as {
    zoneId?: string;
    homeDeliveryPrice?: number;
    deskDeliveryPrice?: number;
    active?: boolean;
  };
  if (!body.zoneId) return NextResponse.json({ error: "Zone is required." }, { status: 400 });
  try {
    await updateDeliveryZone(body.zoneId, {
      ...(body.homeDeliveryPrice !== undefined && {
        homeDeliveryPrice: Number(body.homeDeliveryPrice),
      }),
      ...(body.deskDeliveryPrice !== undefined && {
        deskDeliveryPrice: Number(body.deskDeliveryPrice),
      }),
      ...(body.active !== undefined && { active: body.active }),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to update zone." }, { status: 502 });
  }
}

export async function DELETE(request: Request) {
  if (!(await getCurrentAdmin()))
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { zoneId } = (await request.json()) as { zoneId?: string };
  if (!zoneId) return NextResponse.json({ error: "Zone is required." }, { status: 400 });
  try {
    await deleteDeliveryZone(zoneId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete zone." }, { status: 502 });
  }
}
