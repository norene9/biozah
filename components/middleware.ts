// middleware.ts, at your project root
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.startsWith("/admin/login");
  if (!isAdminRoute) return NextResponse.next();

  const session = request.cookies.get("session")?.value; // TODO: match your actual session cookie name
  if (!session) return NextResponse.redirect(new URL("/admin/login", request.url));
  return NextResponse.next();
}

export const config = { matcher: "/admin/:path*" };