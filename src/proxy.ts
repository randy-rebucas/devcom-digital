import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: Request) {
  const session = await auth();
  const { pathname } = new URL(request.url);

  const protectedPaths = ["/dashboard", "/admin"];
  if (protectedPaths.some((p) => pathname.startsWith(p)) && !session?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/admin") && session?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/tools", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/tools/:path*", "/admin/:path*"],
};
