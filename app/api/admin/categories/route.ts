import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/firebase/server";
import { createFirestoreCategory, updateFirestoreCategory } from "@/lib/firestore";

function slugify(value: string) { return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

export async function POST(request: Request) {
  if (!(await getCurrentAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const body = await request.json() as { name?: string; description?: string; image_url?: string };
  const name = body.name?.trim();
  const slug = name ? slugify(name) : "";
  if (!name || !slug) return NextResponse.json({ error: "A category name is required." }, { status: 400 });
  try { await createFirestoreCategory({ id: `cat-${crypto.randomUUID()}`, name, slug, description: body.description?.trim() ?? "", image_url: body.image_url?.trim() ?? "", active: true }); return NextResponse.json({ ok: true }); } catch { return NextResponse.json({ error: "Unable to create category right now." }, { status: 502 }); }
}

export async function PATCH(request: Request) {
  if (!(await getCurrentAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const body = await request.json() as { categoryId?: string; name?: string; description?: string; image_url?: string; active?: boolean };
  const name = body.name?.trim();
  const slug = name ? slugify(name) : "";
  if (!body.categoryId || !name || !slug || typeof body.active !== "boolean") return NextResponse.json({ error: "Valid category fields are required." }, { status: 400 });
  try { await updateFirestoreCategory(body.categoryId, { name, slug, description: body.description?.trim() ?? "", image_url: body.image_url?.trim() ?? "", active: body.active }); return NextResponse.json({ ok: true }); } catch { return NextResponse.json({ error: "Unable to update category." }, { status: 502 }); }
}
