"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function SearchBar() {
  const router = useRouter();
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
    router.push(`/products?search=${encodeURIComponent(q)}#catalog`);
    setOpen(false);
  }

  if (!open) {
    return (
      <button type="button" className="search-button" aria-label="Search" onClick={() => setOpen(true)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4.5 4.5" />
        </svg>
        <span>Search</span>
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
        placeholder="Search products…"
        aria-label="Search products"
      />
      <button type="button" className="search-close" aria-label="Close search" onClick={() => setOpen(false)}>
        ✕
      </button>
    </form>
  );
}
