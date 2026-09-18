"use client";

import { useEffect, useRef } from "react";

export function ConfirmModal({ open, title, message, confirmLabel = "Delete", onConfirm, onCancel }: { open: boolean; title: string; message: string; confirmLabel?: string; onConfirm: () => void; onCancel: () => void }) {
  const cancelButton = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (!open) return; cancelButton.current?.focus(); const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onCancel(); }; document.addEventListener("keydown", onKeyDown); const previousOverflow = document.body.style.overflow; document.body.style.overflow = "hidden"; return () => { document.removeEventListener("keydown", onKeyDown); document.body.style.overflow = previousOverflow; }; }, [open, onCancel]);
  if (!open) return null;
  return <div className="confirm-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}><section className="confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message"><div className="confirm-icon" aria-hidden="true">!</div><h2 id="confirm-title">{title}</h2><p id="confirm-message">{message}</p><div className="confirm-actions"><button ref={cancelButton} className="button sheet-reset" type="button" onClick={onCancel}>Cancel</button><button className="button button-danger" type="button" onClick={onConfirm}>{confirmLabel}</button></div></section></div>;
}
