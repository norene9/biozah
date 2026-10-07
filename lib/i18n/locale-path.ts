import type { Locale } from "./config";

/**
 * Prefixes an internal path with the current locale.
 * localePath("ar", "/products") -> "/ar/products"
 * localePath("ar", "/")        -> "/ar"
 */
export function localePath(locale: Locale, path: string): string {
  const suffix = path === "/" ? "" : path;
  return `/${locale}${suffix}`;
}
