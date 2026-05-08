import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ADMIN_RESTAURANT = "/admin/restaurant";

const LEGACY_EXACT: Record<string, string> = {
  "/restaurant": ADMIN_RESTAURANT,
  "/restaurant/login": `${ADMIN_RESTAURANT}/login`,
  "/restaurant/profile": `${ADMIN_RESTAURANT}/profile`,
  "/restaurant/settings": `${ADMIN_RESTAURANT}/settings`,
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const target = LEGACY_EXACT[pathname];
  if (target) {
    return NextResponse.redirect(new URL(target, request.url));
  }
  if (pathname.startsWith("/restaurant/edit/")) {
    const rest = pathname.slice("/restaurant/edit/".length);
    return NextResponse.redirect(
      new URL(`${ADMIN_RESTAURANT}/edit/${rest}`, request.url),
    );
  }
  if (pathname === "/catalog") {
    const p = request.nextUrl.searchParams.get("p")?.trim();
    if (p) {
      const u = new URL(request.url);
      u.pathname = `/catalog/dish/${encodeURIComponent(p)}`;
      u.searchParams.delete("p");
      return NextResponse.redirect(u);
    }
  }
  if (pathname === "/restaurants") {
    const r = request.nextUrl.searchParams.get("r")?.trim();
    if (r) {
      const u = new URL(request.url);
      u.pathname = `/restaurants/${encodeURIComponent(r)}`;
      u.searchParams.delete("r");
      return NextResponse.redirect(u);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/restaurant",
    "/restaurant/login",
    "/restaurant/profile",
    "/restaurant/settings",
    "/restaurant/edit/:path*",
    "/catalog",
    "/restaurants",
  ],
};
