import { NextRequest, NextResponse } from "next/server";

const ADMIN_KEY = process.env.PLATFORM_ADMIN_KEY?.trim() ?? "";

export async function POST(request: NextRequest) {
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
    response.cookies.set("admin_session", "1", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  }

  return response;
}
