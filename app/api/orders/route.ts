import { NextResponse } from "next/server";
import { getProducts } from "@/lib/store";
import { createFirestoreOrder } from "@/lib/firestore";
import { sendOrderConfirmation } from "@/lib/email/resend";
import type { OrderInput } from "@/types/store";
import { getCurrentAdmin } from "@/lib/firebase/server";
import { updateFirestoreOrder, updateFirestoreOrderStatus, deleteFirestoreOrder } from "@/lib/firestore";
const deliveryPrices: Record<string, number> = { home: 600, pickup: 350 };
const paymentMethods = new Set(["cash", "transfer"]);

export async function POST(request: Request) {
  try {
    const body = await request.json() as OrderInput;
    if (!body.customer_name?.trim() || !body.email?.includes("@") || !body.phone?.trim() || !body.wilaya?.trim() || !body.commune?.trim() || !body.address?.trim() || !Array.isArray(body.items) || !body.items.length) {
      return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
    }
    if (!(body.delivery_method in deliveryPrices) || !paymentMethods.has(body.payment_method)) return NextResponse.json({ error: "Please choose a valid delivery and payment method." }, { status: 400 });
    const products = await getProducts();
    const lines = body.items.map((item) => {
      const product = products.find((candidate) => candidate.id === item.product_id && candidate.active);
      if (!product || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > product.stock) throw new Error("One of the selected products is no longer available.");
      return { product_id: product.id, product_name: product.name, quantity: item.quantity, unit_price: product.price, subtotal: product.price * item.quantity };
    });
    const subtotal = lines.reduce((sum, line) => sum + line.subtotal, 0);
    const delivery_cost = deliveryPrices[body.delivery_method];
    const order_id = `BZ-${Date.now().toString(36).toUpperCase()}`;
    const order = { order_id, created_at: new Date().toISOString(), customer_name: body.customer_name.trim(), email: body.email.trim(), phone: body.phone.trim(), wilaya: body.wilaya.trim(), commune: body.commune.trim(), address: body.address.trim(), delivery_method: body.delivery_method, payment_method: body.payment_method, subtotal, delivery_cost, total: subtotal + delivery_cost, status: "Pending" };
    await createFirestoreOrder({ ...order, items: lines.map((line) => ({ order_id, ...line })) });
    const email = await sendOrderConfirmation({ ...order, lines });
    return NextResponse.json({ order_id, total: order.total, email_sent: email.sent });
  } catch (error) {
    const message = error instanceof Error && error.message.includes("no longer available") ? error.message : "Unable to place your order right now.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}


// Handles two distinct updates from the order modal: a status-only change ("Save Status"),
// or a full info edit ("Update Order Info"). Distinguished by which fields the body carries.
export async function PATCH(request: Request) {
  if (!(await getCurrentAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const body = await request.json() as {
    orderId?: string;
    status?: string;
    customer_name?: string;
    email?: string;
    phone?: string;
    wilaya?: string;
    commune?: string;
    address?: string;
    delivery_method?: string;
    payment_method?: string;
  };
  if (!body.orderId) return NextResponse.json({ error: "Order is required." }, { status: 400 });

  const isStatusOnly = body.status !== undefined && Object.keys(body).length === 2; // { orderId, status }
  try {
    if (isStatusOnly) {
      await updateFirestoreOrderStatus(body.orderId, body.status!.trim());
    } else {
      const { orderId, ...rest } = body;
      await updateFirestoreOrder(orderId, {
        customer_name: rest.customer_name?.trim(),
        email: rest.email?.trim(),
        phone: rest.phone?.trim(),
        wilaya: rest.wilaya?.trim(),
        commune: rest.commune?.trim(),
        address: rest.address?.trim(),
        delivery_method: rest.delivery_method?.trim(),
        payment_method: rest.payment_method?.trim(),
      });
    }
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Unable to update order." }, { status: 502 }); }
}

export async function DELETE(request: Request) {
  if (!(await getCurrentAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { orderId } = await request.json() as { orderId?: string };
  if (!orderId) return NextResponse.json({ error: "Order is required." }, { status: 400 });
  try { await deleteFirestoreOrder(orderId); return NextResponse.json({ ok: true }); } catch { return NextResponse.json({ error: "Unable to delete order." }, { status: 502 }); }
}
