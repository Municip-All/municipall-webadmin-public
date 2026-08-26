import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

const ALLOWED_ENVS = new Set(["DEV", "PROD"]);

function getExpectedSessionHmac(): string {
  return createHmac("sha256", process.env.PLATFORM_ADMIN_KEY ?? "").update("admin-session").digest("hex");
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/admin") && !pathname.startsWith("/api/admin/auth")) {
    const session = request.cookies.get("admin_session");
    const expected = getExpectedSessionHmac();
    if (!session?.value || session.value !== expected) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 },
      );
    }

    const envCookie = request.cookies.get("admin_env")?.value;
    const envValue = envCookie && ALLOWED_ENVS.has(envCookie) ? envCookie : "DEV";

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-admin-env", envValue);
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/:path*"],
};
