"use client";

import { useState } from "react";

type FooterSettings = {
  businessName: string;
  tagline: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  copyrightText: string;
};

export function SettingsForm({
  adminEmail,
  footerSettings,
}: {
  adminEmail: string;
  footerSettings: FooterSettings;
}) {
  // Account fields (email + password)
  const [email, setEmail] = useState(adminEmail);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [accountStatus, setAccountStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [accountError, setAccountError] = useState("");

  // Footer fields
  const [footer, setFooter] = useState(footerSettings);
  const [footerStatus, setFooterStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [footerError, setFooterError] = useState("");

  function setField(key: keyof FooterSettings, value: string) {
    setFooter((current) => ({ ...current, [key]: value }));
  }

  async function saveAccount(event: React.FormEvent) {
    event.preventDefault();
    setAccountStatus("saving");
    setAccountError("");
    try {
      const res = await fetch("/api/admin/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email !== adminEmail ? email : undefined,
          currentPassword: newPassword ? currentPassword : undefined,
          newPassword: newPassword || undefined,
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? "Could not save.");
      setCurrentPassword("");
      setNewPassword("");
      setAccountStatus("saved");
      setTimeout(() => setAccountStatus("idle"), 2000);
    } catch (err) {
      setAccountStatus("error");
      setAccountError(err instanceof Error ? err.message : "Could not save.");
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
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? "Could not save.");
      setFooterStatus("saved");
      setTimeout(() => setFooterStatus("idle"), 2000);
    } catch (err) {
      setFooterStatus("error");
      setFooterError(err instanceof Error ? err.message : "Could not save.");
    }
  }

  return (
    <div className="ad-cat-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
      <form className="ad-card" onSubmit={saveAccount} style={{ padding: 20 }}>
        <h2 style={{ marginTop: 0 }}>Your account</h2>
        <p style={{ color: "var(--ad-muted)", fontSize: "0.85rem", marginTop: 4 }}>
          Admin sign-in email and password.
        </p>

        <label style={{ display: "block", marginTop: 16, fontSize: "0.82rem", fontWeight: 600 }}>
          Email
          <input className="ad-input" style={{ width: "100%", marginTop: 6 }} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <label style={{ display: "block", marginTop: 16, fontSize: "0.82rem", fontWeight: 600 }}>
          Current password
          <input className="ad-input" style={{ width: "100%", marginTop: 6 }} type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Required to set a new password" />
        </label>

        <label style={{ display: "block", marginTop: 16, fontSize: "0.82rem", fontWeight: 600 }}>
          New password
          <input className="ad-input" style={{ width: "100%", marginTop: 6 }} type="password" autoComplete="new-password" minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Leave blank to keep your current password" />
        </label>

        {accountError && <p style={{ color: "var(--ad-danger-ink)", fontSize: "0.82rem", marginTop: 10 }}>{accountError}</p>}

        <button className="ad-btn" type="submit" disabled={accountStatus === "saving"} style={{ marginTop: 18 }}>
          {accountStatus === "saving" ? "Saving…" : accountStatus === "saved" ? "Saved" : "Save account"}
        </button>
      </form>

      <form className="ad-card" onSubmit={saveFooter} style={{ padding: 20 }}>
        <h2 style={{ marginTop: 0 }}>Site footer</h2>
        <p style={{ color: "var(--ad-muted)", fontSize: "0.85rem", marginTop: 4 }}>
          Shown at the bottom of every storefront page.
        </p>

        <label style={{ display: "block", marginTop: 16, fontSize: "0.82rem", fontWeight: 600 }}>
          Business name
          <input className="ad-input" style={{ width: "100%", marginTop: 6 }} value={footer.businessName} onChange={(e) => setField("businessName", e.target.value)} />
        </label>

        <label style={{ display: "block", marginTop: 16, fontSize: "0.82rem", fontWeight: 600 }}>
          Tagline
          <input className="ad-input" style={{ width: "100%", marginTop: 6 }} value={footer.tagline} onChange={(e) => setField("tagline", e.target.value)} placeholder="A short line under the logo" />
        </label>

        <label style={{ display: "block", marginTop: 16, fontSize: "0.82rem", fontWeight: 600 }}>
          Address
          <textarea className="ad-input" style={{ width: "100%", marginTop: 6, height: 70, padding: 10, resize: "vertical" }} value={footer.address} onChange={(e) => setField("address", e.target.value)} />
        </label>

        <div className="form-row" style={{ marginTop: 16 }}>
          <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>
            Contact email
            <input className="ad-input" style={{ width: "100%", marginTop: 6 }} type="email" value={footer.contactEmail} onChange={(e) => setField("contactEmail", e.target.value)} />
          </label>
          <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>
            Contact phone
            <input className="ad-input" style={{ width: "100%", marginTop: 6 }} type="tel" value={footer.contactPhone} onChange={(e) => setField("contactPhone", e.target.value)} />
          </label>
        </div>

        <label style={{ display: "block", marginTop: 16, fontSize: "0.82rem", fontWeight: 600 }}>
          Instagram URL
          <input className="ad-input" style={{ width: "100%", marginTop: 6 }} value={footer.instagramUrl} onChange={(e) => setField("instagramUrl", e.target.value)} placeholder="https://instagram.com/…" />
        </label>
        <label style={{ display: "block", marginTop: 16, fontSize: "0.82rem", fontWeight: 600 }}>
          Facebook URL
          <input className="ad-input" style={{ width: "100%", marginTop: 6 }} value={footer.facebookUrl} onChange={(e) => setField("facebookUrl", e.target.value)} placeholder="https://facebook.com/…" />
        </label>
        <label style={{ display: "block", marginTop: 16, fontSize: "0.82rem", fontWeight: 600 }}>
          TikTok URL
          <input className="ad-input" style={{ width: "100%", marginTop: 6 }} value={footer.tiktokUrl} onChange={(e) => setField("tiktokUrl", e.target.value)} placeholder="https://tiktok.com/@…" />
        </label>

        <label style={{ display: "block", marginTop: 16, fontSize: "0.82rem", fontWeight: 600 }}>
          Copyright line
          <input className="ad-input" style={{ width: "100%", marginTop: 6 }} value={footer.copyrightText} onChange={(e) => setField("copyrightText", e.target.value)} placeholder="© 2026 biozah. All rights reserved." />
        </label>

        {footerError && <p style={{ color: "var(--ad-danger-ink)", fontSize: "0.82rem", marginTop: 10 }}>{footerError}</p>}

        <button className="ad-btn" type="submit" disabled={footerStatus === "saving"} style={{ marginTop: 18 }}>
          {footerStatus === "saving" ? "Saving…" : footerStatus === "saved" ? "Saved" : "Save footer info"}
        </button>
      </form>
    </div>
  );
}

