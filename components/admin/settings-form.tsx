"use client";

import { useState } from "react";

type StoreSettings = { contactEmail: string; contactPhone: string; bio: string };

export function SettingsForm({
  adminEmail,
  storeSettings,
}: {
  adminEmail: string;
  storeSettings: StoreSettings;
}) {
  // Account fields (email + password)
  const [email, setEmail] = useState(adminEmail);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [accountStatus, setAccountStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [accountError, setAccountError] = useState("");

  // Store fields (contact + bio)
  const [contactEmail, setContactEmail] = useState(storeSettings.contactEmail);
  const [contactPhone, setContactPhone] = useState(storeSettings.contactPhone);
  const [bio, setBio] = useState(storeSettings.bio);
  const [storeStatus, setStoreStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [storeError, setStoreError] = useState("");

  async function saveAccount(event: React.FormEvent) {
    event.preventDefault();
    setAccountStatus("saving");
    setAccountError("");
    try {
      // TODO: create this route (Firebase Admin SDK: updateUser, and re-auth for password
      // changes if you require current-password verification client-side first).
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

  async function saveStore(event: React.FormEvent) {
    event.preventDefault();
    setStoreStatus("saving");
    setStoreError("");
    try {
      // TODO: create this route to write to your settings doc (e.g. settings/store).
      const res = await fetch("/api/admin/store-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactEmail, contactPhone, bio }),
      });
      if (!res.ok) throw new Error("Could not save.");
      setStoreStatus("saved");
      setTimeout(() => setStoreStatus("idle"), 2000);
    } catch {
      setStoreStatus("error");
      setStoreError("Could not save. Try again.");
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
          <input
            className="ad-input"
            style={{ width: "100%", marginTop: 6 }}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label style={{ display: "block", marginTop: 16, fontSize: "0.82rem", fontWeight: 600 }}>
          Current password
          <input
            className="ad-input"
            style={{ width: "100%", marginTop: 6 }}
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Required to set a new password"
          />
        </label>

        <label style={{ display: "block", marginTop: 16, fontSize: "0.82rem", fontWeight: 600 }}>
          New password
          <input
            className="ad-input"
            style={{ width: "100%", marginTop: 6 }}
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Leave blank to keep your current password"
          />
        </label>

        {accountError && <p style={{ color: "var(--ad-danger-ink)", fontSize: "0.82rem", marginTop: 10 }}>{accountError}</p>}

        <button className="ad-btn" type="submit" disabled={accountStatus === "saving"} style={{ marginTop: 18 }}>
          {accountStatus === "saving" ? "Saving…" : accountStatus === "saved" ? "Saved" : "Save account"}
        </button>
      </form>

      <form className="ad-card" onSubmit={saveStore} style={{ padding: 20 }}>
        <h2 style={{ marginTop: 0 }}>Store contact & bio</h2>
        <p style={{ color: "var(--ad-muted)", fontSize: "0.85rem", marginTop: 4 }}>
          Shown to customers on the storefront.
        </p>

        <label style={{ display: "block", marginTop: 16, fontSize: "0.82rem", fontWeight: 600 }}>
          Contact email
          <input
            className="ad-input"
            style={{ width: "100%", marginTop: 6 }}
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
        </label>

        <label style={{ display: "block", marginTop: 16, fontSize: "0.82rem", fontWeight: 600 }}>
          Contact phone
          <input
            className="ad-input"
            style={{ width: "100%", marginTop: 6 }}
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
        </label>

        <label style={{ display: "block", marginTop: 16, fontSize: "0.82rem", fontWeight: 600 }}>
          Store bio
          <textarea
            className="ad-input"
            style={{ width: "100%", marginTop: 6, height: 110, resize: "vertical", padding: 10 }}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A short line shown on the About page."
          />
        </label>

        {storeError && <p style={{ color: "var(--ad-danger-ink)", fontSize: "0.82rem", marginTop: 10 }}>{storeError}</p>}

        <button className="ad-btn" type="submit" disabled={storeStatus === "saving"} style={{ marginTop: 18 }}>
          {storeStatus === "saving" ? "Saving…" : storeStatus === "saved" ? "Saved" : "Save store info"}
        </button>
      </form>
    </div>
  );
}
