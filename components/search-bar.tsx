"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { localePath } from "@/lib/i18n/locale-path";
import { useLocale } from "@/lib/i18n/use-locale";

export function SearchBar({ label, placeholder }: { label: string; placeholder: string }) {
  const router = useRouter();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`${localePath(locale, "/products")}?search=${encodeURIComponent(q)}#catalog`);
    setOpen(false);
  }

  if (!open) {
    return (
      <button type="button" className="search-button" aria-label={label} onClick={() => setOpen(true)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4.5 4.5" />
        </svg>
        <span>{label}</span>
      </button>
    );
  }

  return (
    <form className="search-form" role="search" onSubmit={submit}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4.5 4.5" />
      </svg>
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onBlur={() => { if (!query) setOpen(false); }}
        onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      <button type="button" className="search-close" aria-label="Close search" onClick={() => setOpen(false)}>
        ✕
      </button>
    </form>
  );
}
