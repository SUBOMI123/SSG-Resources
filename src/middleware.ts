import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE, readAdminSessionToken } from "@/lib/session";

const PUBLIC_ADMIN_PATHS = new Set(["/admin/login", "/admin/signup"]);
const PUBLIC_ADMIN_API_PREFIXES = ["/api/admin/auth/login", "/api/admin/auth/signup", "/api/admin/auth/logout"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = token ? await readAdminSessionToken(token) : null;
  const isLoggedIn = Boolean(session);

  const isPublicAdminPage = PUBLIC_ADMIN_PATHS.has(pathname);
  const isPublicAdminApi = PUBLIC_ADMIN_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isLoggedIn && isPublicAdminPage) {
    return NextResponse.redirect(new URL("/admin/inventory", request.url));
  }

  if (isPublicAdminPage || isPublicAdminApi) {
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
    }

    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/inventory/:path*"],
};
