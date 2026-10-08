"use client";

import { useState } from "react";
import type { StoreSettings } from "@/types/store";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

export function SettingsForm({
  adminEmail,
  footerSettings,
  dict,
}: {
  adminEmail: string;
  footerSettings: StoreSettings;
  dict: Dictionary["forms"];
}) {
  // Account fields (email + password)
  const [email, setEmail] = useState(adminEmail);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [accountStatus, setAccountStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [accountError, setAccountError] = useState("");
  const [emailPendingNotice, setEmailPendingNotice] = useState("");

  // Footer / About Us fields
  const [footer, setFooter] = useState<StoreSettings>(footerSettings);
  const [footerStatus, setFooterStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [footerError, setFooterError] = useState("");

  function setField(key: keyof StoreSettings, value: string) {
    setFooter((current) => ({ ...current, [key]: value }));
  }

  async function saveAccount(event: React.FormEvent) {
    event.preventDefault();
    setAccountStatus("saving");
    setAccountError("");
    setEmailPendingNotice("");

    // Front-end validation checks
    const isEmailChanged = email.trim().toLowerCase() !== adminEmail.trim().toLowerCase();
    const isPasswordChanged = Boolean(newPassword);

    if (isPasswordChanged && !currentPassword) {
      setAccountStatus("error");
      setAccountError(dict.currentPasswordHint || "Current password is required to set a new password.");
      return;
    }

    try {
      const res = await fetch("/api/admin/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: isEmailChanged ? email.trim() : undefined,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? dict.unableToSave);

      if (data?.emailPending) {
        setEmailPendingNotice(
          "A confirmation link was sent to your new email address. Please check your inbox to complete the email change."
        );
      }

      setCurrentPassword("");
      setNewPassword("");
      setAccountStatus("saved");
      setTimeout(() => setAccountStatus("idle"), 3000);
    } catch (err) {
      setAccountStatus("error");
      setAccountError(err instanceof Error ? err.message : dict.unableToSave);
    }
  }

  async function saveFooter(event: React.FormEvent) {
    event.preventDefault();
    setFooterStatus("saving");
    setFooterError("");
    try {
      const res = await fetch("/api/admin/store-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(footer),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? dict.unableToSave);

      setFooterStatus("saved");
      setTimeout(() => setFooterStatus("idle"), 2000);
    } catch (err) {
      setFooterStatus("error");
      setFooterError(err instanceof Error ? err.message : dict.unableToSave);
    }
  }

  return (
    <div className="ad-cat-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
      {/* <form className="ad-card" onSubmit={saveAccount} style={{ padding: 20 }}>
        <h2 style={{ marginTop: 0 }}>{dict.yourAccount}</h2>
        <p style={{ color: "var(--ad-muted)", fontSize: "0.85rem", marginTop: 4 }}>
          {dict.accountSub}
        </p>

        <label style={{ display: "block", marginTop: 16, fontSize: "0.82rem", fontWeight: 600 }}>
          {dict.email}
          <input
            className="ad-input"
            style={{ width: "100%", marginTop: 6 }}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>

        <label style={{ display: "block", marginTop: 16, fontSize: "0.82rem", fontWeight: 600 }}>
          {dict.currentPassword}
          <input
            className="ad-input"
            style={{ width: "100%", marginTop: 6 }}
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder={dict.currentPasswordHint}
          />
        </label>

        <label style={{ display: "block", marginTop: 16, fontSize: "0.82rem", fontWeight: 600 }}>
          {dict.newPassword}
          <input
            className="ad-input"
            style={{ width: "100%", marginTop: 6 }}
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={dict.newPasswordHint}
          />
        </label>

        {emailPendingNotice && (
          <p style={{ color: "var(--ad-ok-ink)", fontSize: "0.82rem", marginTop: 10, lineHeight: 1.4 }}>
            {emailPendingNotice}
          </p>
        )}

        {accountError && (
          <p style={{ color: "var(--ad-danger-ink)", fontSize: "0.82rem", marginTop: 10 }}>
            {accountError}
          </p>
        )}

        <button className="ad-btn" type="submit" disabled={accountStatus === "saving"} style={{ marginTop: 18 }}>
          {accountStatus === "saving" ? dict.saving : accountStatus === "saved" ? dict.saved : dict.saveAccount}
        </button>
      </form> */}

      <form className="ad-card" onSubmit={saveFooter} style={{ padding: 20 }}>
        <h2 style={{ marginTop: 0 }}>{dict.aboutUsTitle}</h2>

        <label style={{ display: "block", marginTop: 16, fontSize: "0.82rem", fontWeight: 600 }}>
          {dict.businessName}
          <input
            className="ad-input"
            style={{ width: "100%", marginTop: 6 }}
            value={footer?.businessName || ""}
            onChange={(e) => setField("businessName", e.target.value)}
          />
        </label>

        <label style={{ display: "block", marginTop: 16, fontSize: "0.82rem", fontWeight: 600 }}>
          {dict.tagline}
          <input
            className="ad-input"
            style={{ width: "100%", marginTop: 6 }}
            value={footer?.tagline || ""}
            onChange={(e) => setField("tagline", e.target.value)}
            placeholder={dict.taglineHint}
          />
        </label>

        <label style={{ display: "block", marginTop: 16, fontSize: "0.82rem", fontWeight: 600 }}>
          {dict.address}
          <textarea
            className="ad-input"
            style={{ width: "100%", marginTop: 6, height: 70, padding: 10, resize: "vertical" }}
            value={footer?.address || ""}
            onChange={(e) => setField("address", e.target.value)}
          />
        </label>

        <div className="form-row" style={{ marginTop: 16 }}>
          <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>
            {dict.contactEmail}
            <input
              className="ad-input"
              style={{ width: "100%", marginTop: 6 }}
              type="email"
              value={footer?.contactEmail || ""}
              onChange={(e) => setField("contactEmail", e.target.value)}
            />
          </label>
          <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>
            {dict.contactPhone}
            <input
              className="ad-input"
              style={{ width: "100%", marginTop: 6 }}
              type="tel"
              value={footer?.contactPhone || ""}
              onChange={(e) => setField("contactPhone", e.target.value)}
            />
          </label>
        </div>

        <label style={{ display: "block", marginTop: 16, fontSize: "0.82rem", fontWeight: 600 }}>
          {dict.instagramUrl}
          <input
            className="ad-input"
            style={{ width: "100%", marginTop: 6 }}
            value={footer?.instagramUrl || ""}
            onChange={(e) => setField("instagramUrl", e.target.value)}
            placeholder="https://instagram.com/…"
          />
        </label>

        <label style={{ display: "block", marginTop: 16, fontSize: "0.82rem", fontWeight: 600 }}>
          {dict.facebookUrl}
          <input
            className="ad-input"
            style={{ width: "100%", marginTop: 6 }}
            value={footer?.facebookUrl || ""}
            onChange={(e) => setField("facebookUrl", e.target.value)}
            placeholder="https://facebook.com/…"
          />
        </label>

        <label style={{ display: "block", marginTop: 16, fontSize: "0.82rem", fontWeight: 600 }}>
          {dict.tiktokUrl}
          <input
            className="ad-input"
            style={{ width: "100%", marginTop: 6 }}
            value={footer?.tiktokUrl || ""}
            onChange={(e) => setField("tiktokUrl", e.target.value)}
            placeholder="https://tiktok.com/@…"
          />
        </label>

        <label style={{ display: "block", marginTop: 16, fontSize: "0.82rem", fontWeight: 600 }}>
          {dict.copyrightLine}
          <input
            className="ad-input"
            style={{ width: "100%", marginTop: 6 }}
            value={footer?.copyrightText || ""}
            onChange={(e) => setField("copyrightText", e.target.value)}
            placeholder="© 2026 biozah. All rights reserved."
          />
        </label>

        {footerError && (
          <p style={{ color: "var(--ad-danger-ink)", fontSize: "0.82rem", marginTop: 10 }}>
            {footerError}
          </p>
        )}

        <button className="ad-btn" type="submit" disabled={footerStatus === "saving"} style={{ marginTop: 18 }}>
          {footerStatus === "saving" ? dict.saving : footerStatus === "saved" ? dict.saved : dict.saveFooter}
        </button>
      </form>
    </div>
  );
}
