import { NextRequest, NextResponse } from "next/server";
import { DEV_API_FALLBACK, PROD_API_FALLBACK } from "../../../../lib/environment";

const ADMIN_KEY = process.env.PLATFORM_ADMIN_KEY?.trim() ?? "";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

const ALLOWED_ENVS = new Set(["DEV", "PROD"]);

function getBackendUrl(env: string | null): string {
  if (env === "PROD") {
    return process.env.NEXT_PUBLIC_API_URL || PROD_API_FALLBACK;
  }
  return process.env.NEXT_PUBLIC_API_URL_DEV || DEV_API_FALLBACK;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, await params);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, await params);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, await params);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, await params);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, await params);
}

async function proxyRequest(
  request: NextRequest,
  params: { path: string[] },
) {
  if (!ADMIN_KEY) {
    return NextResponse.json(
      { message: "PLATFORM_ADMIN_KEY is not configured on the server." },
      { status: 500 },
    );
  }

  const contentLength = parseInt(request.headers.get("content-length") || "0", 10);
  if (contentLength > 10 * 1024 * 1024) {
    return NextResponse.json({ message: "Request body too large." }, { status: 413 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (entry && now < entry.resetAt) {
    if (entry.count >= RATE_LIMIT_MAX) {
      return NextResponse.json({ message: "Too many requests." }, { status: 429 });
    }
    entry.count++;
  } else {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  }

  const rawEnv = request.headers.get("x-admin-env") || "DEV";
  if (!ALLOWED_ENVS.has(rawEnv)) {
    return NextResponse.json(
      { message: "Invalid x-admin-env value." },
      { status: 400 },
    );
  }
  const env = rawEnv;
  const backendUrl = getBackendUrl(env);
  const apiPath = "/api/v1/admin/" + params.path.join("/");
  const url = new URL(request.url);
  const targetUrl = `${backendUrl}${apiPath}${url.search}`;

  const headers: Record<string, string> = {
    "x-platform-admin-key": ADMIN_KEY,
  };

  let body: string | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    body = await request.text();
    if (body) {
      const originalContentType = request.headers.get("content-type");
      headers["Content-Type"] = originalContentType || "application/json";
    }
  }

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: body || undefined,
      signal: AbortSignal.timeout(30_000),
    });

    // Normalize empty success responses so the client never chokes on 204.
    if (response.status === 204 || response.status === 205) {
      try {
        await response.arrayBuffer();
      } catch {
        // Backend may already have closed the connection after a successful delete.
      }
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");

    if (isJson) {
      const raw = await response.text();
      if (!raw.trim()) {
        if (response.ok) {
          return NextResponse.json({ success: true }, { status: 200 });
        }
        return new NextResponse(null, { status: response.status });
      }
      try {
        const data = JSON.parse(raw);
        return NextResponse.json(data, { status: response.status });
      } catch {
        return new NextResponse(raw, {
          status: response.status,
          headers: { "content-type": contentType },
        });
      }
    }

    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: contentType ? { "content-type": contentType } : undefined,
    });
  } catch (error: unknown) {
    const isTimeout = error instanceof Error && error.name === "TimeoutError";
    return NextResponse.json(
      { message: isTimeout ? "Backend API request timed out." : "Failed to reach the backend API." },
      { status: isTimeout ? 504 : 502 },
    );
  }
}
