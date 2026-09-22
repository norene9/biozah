import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/firebase/server";
import { createFirestoreCategory, deleteFirestoreCategory, deleteFirestoreProduct, getFirestoreCategoryById, getFirestoreProducts, updateFirestoreCategory } from "@/lib/firestore";
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
  try {
    const previous = await getFirestoreCategoryById(body.categoryId);
    await updateFirestoreCategory(body.categoryId, { name, slug, description: body.description?.trim() ?? "", image_url: body.image_url?.trim() ?? "", image_public_id: body.image_public_id?.trim(), active: body.active });
    if (previous?.image_public_id && previous.image_public_id !== body.image_public_id) {
      await destroyCloudinaryImage(previous.image_public_id).catch(() => {}); // best-effort; don't fail the save if cleanup fails
    }
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Unable to update category." }, { status: 502 }); }
}

// Deletes the category AND every product assigned to it (plus their Cloudinary images).
// This is destructive and irreversible — the client should confirm before calling it.
export async function DELETE(request: Request) {
  if (!(await getCurrentAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { categoryId } = await request.json() as { categoryId?: string };
  if (!categoryId) return NextResponse.json({ error: "Collection is required." }, { status: 400 });
  try {
    const [category, products] = await Promise.all([getFirestoreCategoryById(categoryId), getFirestoreProducts()]);
    const affected = products.filter((product) => product.category_id === categoryId);

    await Promise.all(
      affected.map(async (product) => {
        if (product.image_public_id) await destroyCloudinaryImage(product.image_public_id);
        await deleteFirestoreProduct(product.id);
      }),
    );

    if (category?.image_public_id) await destroyCloudinaryImage(category.image_public_id);
    await deleteFirestoreCategory(categoryId);

    return NextResponse.json({ ok: true, deletedProducts: affected.length });
  } catch {
    return NextResponse.json({ error: "Unable to delete collection." }, { status: 502 });
  }
}
