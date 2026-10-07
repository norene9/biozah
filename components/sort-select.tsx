"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

export function SortSelect({ value, dict }: { value: string; dict: Dictionary["shop"] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "featured") params.delete("sort");
    else params.set("sort", next);
    router.push(`${pathname}?${params.toString()}#catalog`, { scroll: false });
  }

  return (
    <label className="catalog-sort">
      <span>{dict.sortBy}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="featured">{dict.sortFeatured}</option>
        <option value="newest">{dict.sortNewest}</option>
        <option value="price-low">{dict.sortPriceLow}</option>
        <option value="price-high">{dict.sortPriceHigh}</option>
      </select>
    </label>
  );
}
