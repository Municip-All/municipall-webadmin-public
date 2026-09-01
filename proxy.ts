import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ENVS = new Set(["DEV", "PROD"]);

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function getExpectedSessionHmac(): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(process.env.PLATFORM_ADMIN_KEY ?? ""),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode("admin-session"),
  );
  return toHex(signature);
}

function safeEqual(a: string, b: string): boolean {
  const bytesA = new TextEncoder().encode(a);
  const bytesB = new TextEncoder().encode(b);
  if (bytesA.length !== bytesB.length) return false;
  let diff = 0;
  for (let i = 0; i < bytesA.length; i++) {
    diff |= bytesA[i] ^ bytesB[i];
  }
  return diff === 0;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/admin") && !pathname.startsWith("/api/admin/auth")) {
    const session = request.cookies.get("admin_session");
    const expected = await getExpectedSessionHmac();
    if (!session?.value || !safeEqual(session.value, expected)) {
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
