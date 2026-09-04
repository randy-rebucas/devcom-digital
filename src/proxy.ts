import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Optimistic check only: decodes the JWT cookie without hitting the
// database. Full session/role validation (including the revoked-session
// check) still happens in layouts via auth(). See Next.js Proxy docs:
// Proxy is not intended for slow data fetching or full session management.
export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
  const { pathname } = new URL(request.url);

  const protectedPaths = ["/dashboard", "/admin"];
  if (protectedPaths.some((p) => pathname.startsWith(p)) && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/tools", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/tools/:path*", "/admin/:path*"],
};
