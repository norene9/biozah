"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import type { Category } from "@/types/store";

export function ShopFilters({
  categories,
  activeCategory,
  maxPrice,
  priceCeiling,
  totalCount,
}: {
  categories: Category[];
  activeCategory: string;
  maxPrice: number;
  priceCeiling: number;
  totalCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [sliderValue, setSliderValue] = useState(maxPrice);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the slider in sync if the URL changes from elsewhere (back/forward nav).
  useEffect(() => setSliderValue(maxPrice), [maxPrice]);

  function pushParams(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value === null) params.delete(key);
      else params.set(key, value);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}#catalog`, { scroll: false });
    });
  }

  function selectCategory(id: string) {
    pushParams({ category: id === "all" ? null : id });
  }

  function commitPrice(value: number) {
    pushParams({ max: value >= priceCeiling ? null : String(value) });
  }

  function onSliderChange(value: number) {
    setSliderValue(value); // instant visual feedback
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => commitPrice(value), 300); // update the URL/results shortly after dragging stops
  }

  return (
    <aside className="catalog-sidebar">
      <div className="filter-block">
        <div className="filter-title">
          <span>Categories</span>
          <span>−</span>
        </div>

        <label className="filter-option">
          <input type="radio" name="category" checked={activeCategory === "all"} onChange={() => selectCategory("all")} />
          <span>All Products</span>
          <small>{totalCount}</small>
        </label>
        {categories.map((category) => (
          <label className="filter-option" key={category.id}>
            <input
              type="radio"
              name="category"
              checked={activeCategory === category.id}
              onChange={() => selectCategory(category.id)}
            />
            <span>{category.name.charAt(0).toUpperCase() + category.name.slice(1)}</span>
          </label>
        ))}
      </div>

      <div className="filter-block">
        <div className="filter-title">
          <span>Price Range</span>
          <span>−</span>
        </div>

        <input
          className="price-range"
          type="range"
          min="0"
          max={priceCeiling}
          step="100"
          value={sliderValue}
          onChange={(event) => onSliderChange(Number(event.target.value))}
          onMouseUp={(event) => commitPrice(Number((event.target as HTMLInputElement).value))}
          onTouchEnd={(event) => commitPrice(Number((event.target as HTMLInputElement).value))}
          aria-label="Maximum price"
        />

        <div className="price-labels">
          <span>0DA</span>
          <span>{sliderValue >= priceCeiling ? `${priceCeiling}DA+` : `${sliderValue}DA`}</span>
        </div>
      </div>
    </aside>
  );
}
