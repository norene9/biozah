import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/firebase/server";
import { apiKey, cloudName, cloudinarySignature, isCloudinaryConfigured } from "@/lib/cloudinary";

export async function POST(request: Request) {
  if (!(await getCurrentAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!isCloudinaryConfigured() || !cloudName || !apiKey) return NextResponse.json({ error: "Cloudinary is not configured." }, { status: 503 });
  const body = await request.json().catch(() => ({})) as { folder?: string };
  const folder = body.folder === "biozah/categories" ? body.folder : "biozah/products";
  const timestamp = Math.floor(Date.now() / 1000);
  return NextResponse.json({ cloudName, apiKey, timestamp, folder, signature: cloudinarySignature({ folder, timestamp }) });
}
