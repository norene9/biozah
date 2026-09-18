import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin") && !request.nextUrl.pathname.endsWith("/login");
  if (isAdminRoute && !request.cookies.has("biozah-admin-session")) return NextResponse.redirect(new URL("/admin/login", request.url));
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };