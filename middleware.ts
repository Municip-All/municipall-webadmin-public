import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ENVS = new Set(["DEV", "PROD"]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/admin") && !pathname.startsWith("/api/admin/auth")) {
    const session = request.cookies.get("admin_session");
    if (!session?.value) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 },
      );
    }

    const envHeader = request.headers.get("x-admin-env");
    if (envHeader && !ALLOWED_ENVS.has(envHeader)) {
      return NextResponse.json(
        { message: "Invalid environment value" },
        { status: 400 },
      );
    }
  }

  if (pathname.startsWith("/api/admin") && !pathname.startsWith("/api/admin/auth")) {
    const envCookie = request.cookies.get("admin_env")?.value;
    if (envCookie && ALLOWED_ENVS.has(envCookie)) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-admin-env", envCookie);
      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/:path*"],
};
