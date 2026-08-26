import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

const ADMIN_KEY = process.env.PLATFORM_ADMIN_KEY?.trim() ?? "";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAP_MAX = 1000;
let rateLimitRequestCount = 0;

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

function cleanupRateLimitMap(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (entry.resetAt < now) {
      rateLimitMap.delete(key);
    }
  }
  if (rateLimitMap.size > RATE_LIMIT_MAP_MAX) {
    const entries = [...rateLimitMap.entries()].sort((a, b) => a[1].resetAt - b[1].resetAt);
    const toDelete = entries.slice(0, entries.length - RATE_LIMIT_MAP_MAX);
    for (const [key] of toDelete) {
      rateLimitMap.delete(key);
    }
  }
}

function getSessionHmac(): string {
  return createHmac("sha256", process.env.PLATFORM_ADMIN_KEY ?? "").update("admin-session").digest("hex");
}

export async function POST(request: NextRequest) {
  if (!ADMIN_KEY) {
    return NextResponse.json(
      { valid: false, error: "PLATFORM_ADMIN_KEY is not configured on the server." },
      { status: 500 },
    );
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  rateLimitRequestCount++;
  if (rateLimitRequestCount % 100 === 0) {
    cleanupRateLimitMap();
  }

  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (entry && now < entry.resetAt) {
    if (entry.count >= RATE_LIMIT_MAX) {
      return NextResponse.json(
        { valid: false, error: "Too many attempts. Try again later." },
        { status: 429 },
      );
    }
    entry.count++;
  } else {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  }

  let body: { code?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ valid: false, error: "Invalid JSON body." }, { status: 400 });
  }
  const code = typeof body.code === "string" ? body.code.trim() : "";

  const valid = safeEqual(code, ADMIN_KEY);

  const response = NextResponse.json({ valid });

  if (valid) {
    const hmac = getSessionHmac();
    response.cookies.set("admin_session", hmac, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  }

  return response;
}
