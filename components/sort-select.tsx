"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function SortSelect({ value }: { value: string }) {
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
      <span>Sort by</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="featured">Best Selling</option>
        <option value="newest">Newest</option>
        <option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option>
      </select>
    </label>
  );
}
