import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/firebase/server";
import { getFirestoreOrders, updateFirestoreOrderStatus } from "@/lib/firestore";

export async function GET() {
  if (!(await getCurrentAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try { return NextResponse.json({ orders: await getFirestoreOrders() }); } catch { return NextResponse.json({ error: "Orders are temporarily unavailable." }, { status: 502 }); }
}

export async function PATCH(request: Request) {
  if (!(await getCurrentAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { orderId, status } = await request.json() as { orderId?: string; status?: string };
  const statuses = ["Pending", "Confirmed", "Preparing", "Shipped", "Delivered", "Cancelled"];
  if (!orderId || !status || !statuses.includes(status)) return NextResponse.json({ error: "A valid order and status are required." }, { status: 400 });
  try { await updateFirestoreOrderStatus(orderId, status); return NextResponse.json({ ok: true }); } catch { return NextResponse.json({ error: "Unable to update this order." }, { status: 502 }); }
}
