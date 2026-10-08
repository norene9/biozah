import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/firebase/server";
import { getAuth } from "firebase-admin/auth";
import { getFirebaseAdminApp } from "@/lib/firebase/admin";
import { createEmailVerificationToken } from "@/lib/firebase/tokens";
import { sendEmail } from "@/lib/email/resend";

export async function PATCH(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { email, currentPassword, newPassword } = await request.json();
    const app = getFirebaseAdminApp();
    if (!app) {
      return NextResponse.json({ error: "Firebase Admin configuration error." }, { status: 500 });
    }
    const auth = getAuth(app);

    // 1. Password Update (Verifies Current Password First)
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to set a new password." },
          { status: 400 }
        );
      }

      // Verify current password by attempting sign-in via REST API
      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      const verifyRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: admin.email,
            password: currentPassword,
            returnSecureToken: true,
          }),
        }
      );

      if (!verifyRes.ok) {
        return NextResponse.json({ error: "Incorrect current password." }, { status: 400 });
      }

      // Update password in Firebase Auth
      await auth.updateUser(admin.uid, { password: newPassword });
    }

    // 2. Email Change Request (Dispatches Verification Email via sendEmail)
    let emailPending = false;
    if (email && email.trim().toLowerCase() !== admin.email?.trim().toLowerCase()) {
      const newEmail = email.trim();

      // Check if email is already taken
      try {
        await auth.getUserByEmail(newEmail);
        return NextResponse.json(
          { error: "This email address is already in use by another account." },
          { status: 400 }
        );
      } catch {
        // Email is available
      }

      // Generate confirmation token & URL
      const token = await createEmailVerificationToken(admin.uid, newEmail);
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const confirmUrl = `${baseUrl}/api/admin/confirm-email?token=${token}`;

      // 👈 ACTUALLY CALLING sendEmail HERE
      await sendEmail({
        to: newEmail,
        subject: "Confirm your new Admin Email — Biozah",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
            <h2 style="color: #111; margin-top: 0;">Confirm New Email Address</h2>
            <p style="color: #555; line-height: 1.5;">
              You requested to change your admin email address for Biozah. Click the link below to confirm this change:
            </p>
            <div style="margin: 24px 0;">
              <a href="${confirmUrl}" style="background-color: #000; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                Confirm Email Address
              </a>
            </div>
            <p style="color: #888; font-size: 0.82rem;">
              This link will expire in 24 hours.
            </p>
          </div>
        `,
      });

      emailPending = true;
    }

    return NextResponse.json({ ok: true, emailPending });
  } catch (error) {
    console.error("Account update error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update account settings." },
      { status: 500 }
    );
  }
}