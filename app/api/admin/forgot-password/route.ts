import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getFirebaseAdminApp } from "@/lib/firebase/admin";
import { createPasswordResetToken } from "@/lib/firebase/tokens";
import { sendEmail } from "@/lib/email/resend";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const app = getFirebaseAdminApp();
    if (!app) {
      return NextResponse.json({ error: "Server error." }, { status: 500 });
    }

    const auth = getAuth(app);
    let user;
    try {
      user = await auth.getUserByEmail(email.trim().toLowerCase());
    } catch {
      // Return success even if user not found to prevent email enumeration
      return NextResponse.json({
        ok: true,
        message: "If an account with that email exists, a reset link has been sent.",
      });
    }

    if (user) {
      const token = await createPasswordResetToken(user.email!);
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const resetUrl = `${baseUrl}/admin/reset-password?token=${token}`;

      await sendEmail({
        to: user.email!,
        subject: "Reset your Admin Password — Biozah",
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 8px;">
            <h2 style="margin-top: 0; color: #111;">Reset Your Admin Password</h2>
            <p style="color: #555; line-height: 1.5;">
              We received a request to reset your admin account password. Click the button below to choose a new password:
            </p>
            <div style="margin: 24px 0;">
              <a href="${resetUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #888; font-size: 0.82rem; margin-bottom: 0;">
              This link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email.
            </p>
          </div>
        `,
      });
    }

    return NextResponse.json({
      ok: true,
      message: "If an account with that email exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Unable to process password reset." }, { status: 500 });
  }
}