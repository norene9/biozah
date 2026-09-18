import { NextResponse } from "next/server";
import { getProducts } from "@/lib/store";
import { createFirestoreOrder } from "@/lib/firestore";
import { sendOrderConfirmation } from "@/lib/email/resend";
import type { OrderInput } from "@/types/store";

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
