"use client";

import { usePathname } from "next/navigation";
import { defaultLocale, locales, type Locale } from "./config";

/**
 * Reads the active locale from the first pathname segment.
 * For client components that cannot receive `params` from a layout.
 */
export function useLocale(): Locale {
  const pathname = usePathname() ?? "";
  const segment = pathname.split("/")[1] ?? "";
  return (locales as readonly string[]).includes(segment)
    ? (segment as Locale)
    : defaultLocale;
}
