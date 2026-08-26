import { getStoredAdminEnvironment } from "./environment";

function getAdminEnv(): string {
  if (typeof window === "undefined") return "DEV";
  return getStoredAdminEnvironment();
}

export async function assertPlatformAdminKeyConfigured(): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/health", { method: "GET" });
    if (res.status === 500) {
      const body = await res.json().catch(() => ({}));
      if (typeof body === "object" && body !== null && "message" in body && String(body.message).includes("PLATFORM_ADMIN_KEY")) {
        console.error("PLATFORM_ADMIN_KEY is not configured on the server.");
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

export async function adminFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const bffPath = `/api/admin${path.replace(/^\/api\/v1\/admin/, "")}`;
  const env = getAdminEnv();

  return fetch(bffPath, {
    ...init,
    signal: init?.signal ?? AbortSignal.timeout(30_000),
    headers: {
      "Content-Type": "application/json",
      "x-admin-env": env,
      ...(init?.headers as Record<string, string> | undefined),
    },
  });
}

export async function parseAdminJson<T>(response: Response): Promise<T> {
  let body: unknown = {};
  try {
    body = await response.json();
  } catch {
    body = {};
  }

  if (!response.ok) {
    const rawMessage =
      typeof body === "object" && body !== null && "message" in body
        ? (body as { message: unknown }).message
        : undefined;

    let message = `Erreur API (${response.status})`;
    if (typeof rawMessage === "string") {
      message = rawMessage;
    } else if (Array.isArray(rawMessage)) {
      message = rawMessage
        .filter((m): m is string => typeof m === "string")
        .join(" · ");
    }

    if (response.status === 403 && message.includes("PLATFORM_ADMIN_KEY")) {
      throw new Error(
        "Le serveur API n'a pas PLATFORM_ADMIN_KEY configurée. " +
          "Ajoutez le secret GitHub PLATFORM_ADMIN_KEY et redéployez le backend.",
      );
    }

    if (response.status === 500) {
      const serverMsg =
        typeof body === "object" && body !== null && "message" in body
          ? (body as { message: unknown }).message
          : null;
      if (typeof serverMsg === "string" && serverMsg.includes("PLATFORM_ADMIN_KEY")) {
        throw new Error(
          "Clé plateforme non configurée sur le serveur (PLATFORM_ADMIN_KEY).",
        );
      }
    }

    throw new Error(message);
  }

  if (typeof body === "object" && body !== null && "data" in body) {
    return (body as { data: T }).data;
  }

  return body as T;
}
