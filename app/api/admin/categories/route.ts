import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/firebase/server";
import { createFirestoreCategory, deleteFirestoreCategory, getFirestoreCategoryById, getFirestoreProducts, updateFirestoreCategory } from "@/lib/firestore";
import { destroyCloudinaryImage } from "@/lib/cloudinary";

function slugify(value: string) { return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

export async function POST(request: Request) {
  if (!(await getCurrentAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const body = await request.json() as { name?: string; description?: string; image_url?: string; image_public_id?: string };
  const name = body.name?.trim();
  const slug = name ? slugify(name) : "";
  if (!name || !slug) return NextResponse.json({ error: "A category name is required." }, { status: 400 });
  try { await createFirestoreCategory({ id: `cat-${crypto.randomUUID()}`, name, slug, description: body.description?.trim() ?? "", image_url: body.image_url?.trim() ?? "", image_public_id: body.image_public_id?.trim(), active: true }); return NextResponse.json({ ok: true }); } catch { return NextResponse.json({ error: "Unable to create category right now." }, { status: 502 }); }
}

export async function PATCH(request: Request) {
  if (!(await getCurrentAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const body = await request.json() as { categoryId?: string; name?: string; description?: string; image_url?: string; image_public_id?: string; active?: boolean };
  const name = body.name?.trim();
  const slug = name ? slugify(name) : "";
  if (!body.categoryId || !name || !slug || typeof body.active !== "boolean") return NextResponse.json({ error: "Valid category fields are required." }, { status: 400 });
  try { await updateFirestoreCategory(body.categoryId, { name, slug, description: body.description?.trim() ?? "", image_url: body.image_url?.trim() ?? "", image_public_id: body.image_public_id?.trim(), active: body.active }); return NextResponse.json({ ok: true }); } catch { return NextResponse.json({ error: "Unable to update category." }, { status: 502 }); }
}

export async function DELETE(request: Request) {
  if (!(await getCurrentAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { categoryId } = await request.json() as { categoryId?: string };
  if (!categoryId) return NextResponse.json({ error: "Collection is required." }, { status: 400 });
  try { const products = await getFirestoreProducts(); if (products.some((product) => product.category_id === categoryId)) return NextResponse.json({ error: "Move or remove this collection's products before deleting it." }, { status: 409 }); const category = await getFirestoreCategoryById(categoryId); if (category?.image_public_id) await destroyCloudinaryImage(category.image_public_id); await deleteFirestoreCategory(categoryId); return NextResponse.json({ ok: true }); } catch { return NextResponse.json({ error: "Unable to delete collection." }, { status: 502 }); }
}
