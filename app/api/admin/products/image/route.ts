import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/firebase/server";
import { updateFirestoreProduct } from "@/lib/firestore";

export async function PATCH(request: Request) {
  if (!(await getCurrentAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const body = await request.json() as { productId?: string; imageUrl?: string; imagePublicId?: string };
  if (!body.productId || body.imageUrl === undefined || body.imagePublicId === undefined) return NextResponse.json({ error: "Product and image details are required." }, { status: 400 });
  try { await updateFirestoreProduct(body.productId, { image_url: body.imageUrl, image_public_id: body.imagePublicId }); return NextResponse.json({ ok: true }); } catch { return NextResponse.json({ error: "Unable to associate the image with this product." }, { status: 502 }); }
}
