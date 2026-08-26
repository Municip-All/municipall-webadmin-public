import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

const ADMIN_KEY = process.env.PLATFORM_ADMIN_KEY?.trim() ?? "";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

function getSessionHmac(): string {
  return createHmac("sha256", process.env.PLATFORM_ADMIN_KEY ?? "").update("admin-session").digest("hex");
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

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

  const body = await request.json();
  const code = typeof body.code === "string" ? body.code.trim() : "";

  if (!ADMIN_KEY) {
    return NextResponse.json(
      { valid: false, error: "PLATFORM_ADMIN_KEY is not configured on the server." },
      { status: 500 },
    );
  }

  const valid = code.toUpperCase() === ADMIN_KEY.toUpperCase();

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
