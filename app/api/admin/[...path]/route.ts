import { NextRequest, NextResponse } from "next/server";
import { DEV_API_FALLBACK, PROD_API_FALLBACK } from "../../../../lib/environment";

const ADMIN_KEY = process.env.PLATFORM_ADMIN_KEY?.trim() ?? "";

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
    const originalContentType = request.headers.get("content-type");
    headers["Content-Type"] = originalContentType || "application/json";
  } else {
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      signal: AbortSignal.timeout(30_000),
    });

    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");

    if (isJson) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: { "content-type": contentType },
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error("[BFF Proxy] Error proxying request:", error);
    return NextResponse.json(
      { message: "Failed to reach the backend API." },
      { status: 502 },
    );
  }
}
