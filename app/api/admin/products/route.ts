import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/firebase/server";
import {
  createFirestoreProduct,
  deleteFirestoreProduct,
  getFirestoreProductById,
  updateFirestoreProduct,
} from "@/lib/firestore";
import { destroyCloudinaryImage } from "@/lib/cloudinary";
import type {  Product } from "@/types/store";
function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(request: Request) {
  if (!(await getCurrentAdmin()))
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const body = (await request.json()) as {
    name?: string;
    description?: string;
    category_id?: string;
    price?: number;
    currency?: string;
    image_url?: string;
    image_public_id?: string;
    stock?: number;
    active?: boolean;
    featured?: boolean;
  };
  const name = body.name?.trim();
  const slug = name ? slugify(name) : "";
  if (
    !name ||
    !slug ||
    !body.category_id ||
    body.price === undefined ||
    !Number.isFinite(body.price) ||
    body.price < 0 ||
    body.stock === undefined ||
    !Number.isInteger(body.stock) ||
    body.stock < 0 ||
    !body.image_url ||
    !body.image_public_id
  )
    return NextResponse.json(
      { error: "Name, category, price, stock, and a Cloudinary image are required." },
      { status: 400 },
    );
  try {
    const product = {
      id: `product-${crypto.randomUUID()}`,
      name,
      slug,
      description: body.description?.trim() ?? "",
      category_id: body.category_id,
      price: body.price,
      currency: body.currency?.trim() || "DZD",
      image_url: body.image_url,
      image_public_id: body.image_public_id,
      stock: body.stock,
      active: body.active ?? true,
      featured: body.featured ?? false,
    };
    await createFirestoreProduct(product);
    return NextResponse.json({ ok: true, product });
  } catch {
    return NextResponse.json({ error: "Unable to create product right now." }, { status: 502 });
  }
}

export async function PATCH(request: Request) {
  if (!(await getCurrentAdmin()))
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
 
  const body = (await request.json()) as {
    productId?: string;
    price?: number;
    stock?: number;
    active?: boolean;
    featured?: boolean;
    name?: string;
    description?: string;
    category_id?: string;
    image_url?: string;
    image_public_id?: string;
    discount_percent?: number;
  };
  const { productId, price, stock, active, featured } = body;
 
  if (
    !productId ||
    price === undefined ||
    !Number.isFinite(price) ||
    price < 0 ||
    stock === undefined ||
    !Number.isInteger(stock) ||
    stock < 0 ||
    typeof active !== "boolean" ||
    typeof featured !== "boolean"
  )
    return NextResponse.json({ error: "Valid product fields are required." }, { status: 400 });
 
  if (
    body.discount_percent !== undefined &&
    (!Number.isInteger(body.discount_percent) || body.discount_percent < 0 || body.discount_percent > 99)
  )
    return NextResponse.json({ error: "Discount must be a whole number from 0 to 99." }, { status: 400 });
 
  // Only include fields that were actually sent — Firestore's Admin SDK rejects `undefined` values.
  const updates: Partial<Omit<Product, "id">> = { price, stock, active, featured };
 
  if (body.name !== undefined) {
    const name = body.name.trim();
    if (!name) return NextResponse.json({ error: "Product name cannot be empty." }, { status: 400 });
    updates.name = name;
  }
  if (body.description !== undefined) updates.description = body.description.trim();
  if (body.category_id) updates.category_id = body.category_id;
  if (body.image_url !== undefined) updates.image_url = body.image_url;
  if (body.image_public_id !== undefined) updates.image_public_id = body.image_public_id;
  if (body.discount_percent !== undefined) updates.discount_percent = body.discount_percent;
 
  try {
    await updateFirestoreProduct(productId, updates);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to update this product." }, { status: 502 });
  }
}
 







































export async function DELETE(request: Request) {
  if (!(await getCurrentAdmin()))
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { productId } = (await request.json()) as { productId?: string };
  if (!productId) return NextResponse.json({ error: "Product is required." }, { status: 400 });
  try {
    const product = await getFirestoreProductById(productId);
    if (product?.image_public_id) await destroyCloudinaryImage(product.image_public_id);
    await deleteFirestoreProduct(productId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete product and its image." }, { status: 502 });
  }
}
