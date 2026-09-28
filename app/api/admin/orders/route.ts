import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/firebase/server";
import { getFirestoreOrders, updateFirestoreOrderStatus,updateFirestoreOrder } from "@/lib/firestore";

export async function GET() {
  if (!(await getCurrentAdmin()))
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    return NextResponse.json({ orders: await getFirestoreOrders() });
  } catch {
    return NextResponse.json({ error: "Orders are temporarily unavailable." }, { status: 502 });
  }
}

export async function PATCH(request: Request) {
  if (!(await getCurrentAdmin()))
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = (await request.json()) as {
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
    delivery_cost?: number;
    subtotal?: number;
    discount_amount?: number;
    total?: number;
  };

  const { orderId, ...fieldsToUpdate } = body;

  if (!orderId) {
    return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
  }

  const statuses = ["Pending", "Confirmed", "Preparing", "Shipped", "Delivered", "Cancelled"];
  if (fieldsToUpdate.status && !statuses.includes(fieldsToUpdate.status)) {
    return NextResponse.json({ error: "Invalid status provided." }, { status: 400 });
  }

  try {
    // Filter out undefined values from the patch payload
    const updatePayload = Object.fromEntries(
      Object.entries(fieldsToUpdate).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: "No fields provided to update." }, { status: 400 });
    }

    await updateFirestoreOrder(orderId, updatePayload);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Unable to update this order." }, { status: 502 });
  }
}
