import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "@/lib/i18n/config";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Ensure every page URL carries a locale prefix (/en, /ar, /fr)
  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (!hasLocale) {
    const acceptLanguage = (request.headers.get("accept-language") ?? "").toLowerCase();
    const detected = acceptLanguage.startsWith("ar")
      ? "ar"
      : acceptLanguage.startsWith("fr")
        ? "fr"
        : defaultLocale;
    return NextResponse.redirect(new URL(`/${detected}${pathname}${search}`, request.url));
  }

  // 2. Admin guard — strip the locale prefix before checking
  const segments = pathname.split("/"); // ["", "en", "admin", ...]
  const locale = segments[1];
  const pathAfterLocale = "/" + segments.slice(2).join("/");

  const isAdminRoute =
    pathAfterLocale.startsWith("/admin") && !pathAfterLocale.startsWith("/admin/login");
  if (isAdminRoute && !request.cookies.has("biozah-admin-session")) {
    return NextResponse.redirect(new URL(`/${locale}/admin/login`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Skip API routes, Next internals, and static files (anything with an extension)
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};