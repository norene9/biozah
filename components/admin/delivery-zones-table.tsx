"use client";

import { useState } from "react";
import type { DeliveryZone } from "@/lib/firebase/delivery";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

export function DeliveryZonesTable({ initialZones, dict }: { initialZones: DeliveryZone[]; dict: Dictionary["forms"] }) {
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
    if (!response.ok) setError((await response.json().catch(() => null))?.error ?? dict.zonesSaveError);
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
      setError((await response.json().catch(() => null))?.error ?? dict.zonesSeedError);
    }
    setSeeding(false);
  }

  return (
    <section className="ad-card">
      <div className="ad-card-head">
        <div>
          <h2>{dict.zonesTitle}</h2>
          <p>{dict.zonesSub}</p>
        </div>
        {zones.length === 0 && (
          <button type="button" className="ad-btn" disabled={seeding} onClick={() => void seed()}>
            {seeding ? dict.addingWilayas : dict.addAllWilayas}
          </button>
        )}
      </div>

      {error && <p className="form-error" style={{ padding: "0 20px" }}>{error}</p>}

      {zones.length === 0 ? (
        <p className="ad-empty">{dict.noZones}</p>
      ) : (
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>{dict.wilayaCol}</th>
                <th>{dict.homeDeliveryCol}</th>
                <th>{dict.deskCol}</th>
                <th>{dict.activeCol}</th>
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
                      {savingId === zone.id ? dict.saving : dict.save}
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
