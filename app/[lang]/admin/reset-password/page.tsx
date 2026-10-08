"use client";

import { useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  if (!token) {
    return (
      <div style={{ maxWidth: 400, margin: "80px auto", padding: 24, textAlign: "center" }}>
        <h2>Invalid Link</h2>
        <p>No reset token was provided. Please request a new password reset link.</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setStatus("saving");
    setError("");

    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to reset password.");

      setStatus("saved");
      setTimeout(() => {
        router.push("/admin/login?message=PasswordResetSuccess");
      }, 2000);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unable to reset password.");
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: 24 }}>
      <form className="ad-card" onSubmit={handleSubmit} style={{ padding: 24 }}>
        <h2 style={{ marginTop: 0 }}>Reset Your Password</h2>
        <p style={{ color: "var(--ad-muted)", fontSize: "0.85rem" }}>
          Enter a new password for your admin account.
        </p>

        <label style={{ display: "block", marginTop: 16, fontSize: "0.82rem", fontWeight: 600 }}>
          New Password
          <input
            className="ad-input"
            style={{ width: "100%", marginTop: 6 }}
            type="password"
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </label>

        <label style={{ display: "block", marginTop: 16, fontSize: "0.82rem", fontWeight: 600 }}>
          Confirm New Password
          <input
            className="ad-input"
            style={{ width: "100%", marginTop: 6 }}
            type="password"
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </label>

        {error && <p style={{ color: "var(--ad-danger-ink)", fontSize: "0.82rem", marginTop: 12 }}>{error}</p>}
        {status === "saved" && (
          <p style={{ color: "var(--ad-ok-ink)", fontSize: "0.82rem", marginTop: 12 }}>
            Password reset! Redirecting to login...
          </p>
        )}

        <button
          className="ad-btn"
          type="submit"
          disabled={status === "saving" || status === "saved"}
          style={{ marginTop: 20, width: "100%" }}
        >
          {status === "saving" ? "Updating..." : "Set New Password"}
        </button>
      </form>
    </div>
  );
}