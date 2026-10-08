type OrderEmail = { order_id: string; customer_name: string; email: string; lines: Array<{ product_name: string; quantity: number; unit_price: number; subtotal: number }>; subtotal: number; delivery_method: string; delivery_cost: number; payment_method: string; total: number };
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    const from = process.env.EMAIL_FROM;
     if (!resend || !from) return { sent: false, reason: "Email is not configured." };
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || "Biozah Admin <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    });

    if (data.error) {
      console.error("Resend API error:", data.error);
      throw new Error(data.error.message);
    }

    return { success: true, id: data.data?.id };
  } catch (error) {
    console.error("Failed to send email via Resend:", error);
    throw new Error("Unable to send email notification.");
  }
}
export async function sendOrderConfirmation(order: OrderEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return { sent: false, reason: "Email is not configured." };
  const items = order.lines.map((line) => `<li>${line.product_name} x${line.quantity} - ${line.subtotal.toLocaleString()} DZD</li>`).join("");
  const html = `<div style="font-family:Arial,sans-serif;color:#183c35"><h1>Order ${order.order_id}</h1><p>Hi ${order.customer_name}, thank you for your order.</p><ul>${items}</ul><p>Subtotal: ${order.subtotal.toLocaleString()} DZD<br>Delivery: ${order.delivery_cost.toLocaleString()} DZD<br><strong>Total: ${order.total.toLocaleString()} DZD</strong></p><p>Delivery: ${order.delivery_method}<br>Payment: ${order.payment_method}</p><p>We will contact you shortly to confirm the next step.</p></div>`;
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [order.email], subject: `Your biozah order ${order.order_id}`, html }) });
  return response.ok ? { sent: true } : { sent: false, reason: "The confirmation email could not be sent." };
}
