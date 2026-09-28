"use client";

import { useState } from "react";
import type { DeliveryZone } from "@/lib/firebase/delivery";

export function DeliveryZonesTable({ initialZones }: { initialZones: DeliveryZone[] }) {
  const [zones, setZones] = useState(initialZones);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState("");

  function setZone(id: string, patch: Partial<DeliveryZone>) {
    setZones((current) => current.map((z) => (z.id === id ? { ...z, ...patch } : z)));
  }

  async function save(zone: DeliveryZone) {
    setSavingId(zone.id);
    setError("");
    const response = await fetch("/api/admin/delivery-zones", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        zoneId: zone.id,
        homeDeliveryPrice: zone.homeDeliveryPrice,
        deskDeliveryPrice: zone.deskDeliveryPrice,
        active: zone.active,
      }),
    });
    if (!response.ok) setError((await response.json().catch(() => null))?.error ?? "Unable to save.");
    setSavingId(null);
  }

  async function seed() {
    setSeeding(true);
    setError("");
    const response = await fetch("/api/admin/delivery-zones/seed", { method: "POST" });
    if (response.ok) {
      const refreshed = await fetch("/api/admin/delivery-zones").then((r) => r.json());
      setZones(refreshed);
    } else {
      setError((await response.json().catch(() => null))?.error ?? "Unable to seed zones.");
    }
    setSeeding(false);
  }

  return (
    <section className="ad-card">
      <div className="ad-card-head">
        <div>
          <h2>Delivery zones</h2>
          <p>Home and stop-desk delivery prices per wilaya</p>
        </div>
        {zones.length === 0 && (
          <button type="button" className="ad-btn" disabled={seeding} onClick={() => void seed()}>
            {seeding ? "Adding all wilayas…" : "Add all 58 wilayas"}
          </button>
        )}
      </div>

      {error && <p className="form-error" style={{ padding: "0 20px" }}>{error}</p>}

      {zones.length === 0 ? (
        <p className="ad-empty">No delivery zones yet. Click "Add all 58 wilayas" to start.</p>
      ) : (
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Wilaya</th>
                <th>Home delivery (DZD)</th>
                <th>Stop desk (DZD)</th>
                <th>Active</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {zones.map((zone) => (
                <tr key={zone.id}>
                  <td>{zone.wilayaCode} — {zone.wilayaName}</td>
                  <td>
                    <input
                      className="ad-input"
                      style={{ width: 110 }}
                      type="number"
                      min="0"
                      value={zone.homeDeliveryPrice}
                      onChange={(e) => setZone(zone.id, { homeDeliveryPrice: Number(e.target.value) })}
                    />
                  </td>
                  <td>
                    <input
                      className="ad-input"
                      style={{ width: 110 }}
                      type="number"
                      min="0"
                      value={zone.deskDeliveryPrice}
                      onChange={(e) => setZone(zone.id, { deskDeliveryPrice: Number(e.target.value) })}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={zone.active}
                      onChange={(e) => setZone(zone.id, { active: e.target.checked })}
                    />
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className="ad-link-btn"
                      disabled={savingId === zone.id}
                      onClick={() => void save(zone)}
                    >
                      {savingId === zone.id ? "Saving…" : "Save"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
