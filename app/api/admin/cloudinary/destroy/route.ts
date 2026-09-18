import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/firebase/server";
import { apiKey, cloudinarySignature, isCloudinaryConfigured } from "@/lib/cloudinary";

export async function POST(request: Request) {
  if (!(await getCurrentAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!isCloudinaryConfigured() || !apiKey) return NextResponse.json({ error: "Cloudinary is not configured." }, { status: 503 });
  const { publicId } = await request.json() as { publicId?: string };
  if (!publicId) return NextResponse.json({ error: "Missing image public ID." }, { status: 400 });
  const timestamp = Math.floor(Date.now() / 1000);
  const body = new URLSearchParams({ public_id: publicId, timestamp: String(timestamp), api_key: apiKey, signature: cloudinarySignature({ public_id: publicId, timestamp }) });
  const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/destroy`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
  if (!response.ok) return NextResponse.json({ error: "Unable to delete the Cloudinary image." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
