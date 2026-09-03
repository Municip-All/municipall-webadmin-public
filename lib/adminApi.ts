import {
  getStoredAdminEnvironment,
  syncAdminEnvironmentCookie,
} from "./environment";

function getAdminEnv(): string {
  if (typeof window === "undefined") return "DEV";
  return getStoredAdminEnvironment();
}

export async function assertPlatformAdminKeyConfigured(): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/health", {
      method: "GET",
      credentials: "same-origin",
    });
    if (res.status === 401) return false;
    if (res.status === 500) {
      const body = await res.json().catch(() => ({}));
      if (
        typeof body === "object" &&
        body !== null &&
        "message" in body &&
        String(body.message).includes("PLATFORM_ADMIN_KEY")
      ) {
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
  syncAdminEnvironmentCookie();
  const bffPath = `/api/admin${path.replace(/^\/api\/v1\/admin/, "")}`;
  const env = getAdminEnv();
  const method = (init?.method ?? "GET").toUpperCase();
  const hasBody = init?.body != null && init.body !== "";

  const headers: Record<string, string> = {
    "x-admin-env": env,
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (hasBody || (method !== "GET" && method !== "HEAD" && method !== "DELETE")) {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
  }

  return fetch(bffPath, {
    ...init,
    signal: init?.signal ?? AbortSignal.timeout(30_000),
    headers,
  });
}

export type AdminActionResult = { ok: true } | { ok: false; message: string };

export type AdminDeleteResult = AdminActionResult;

function extractApiMessage(body: unknown, fallback: string): string {
  if (typeof body !== "object" || body === null || !("message" in body)) {
    return fallback;
  }
  const raw = (body as { message: unknown }).message;
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) {
    const parts = raw.filter((m): m is string => typeof m === "string");
    return parts.length > 0 ? parts.join(" · ") : fallback;
  }
  return fallback;
}

export async function adminPost(
  path: string,
  verifySucceeded?: () => Promise<boolean>,
): Promise<AdminActionResult> {
  try {
    const response = await adminFetch(path, { method: "POST" });
    if (response.ok) return { ok: true };

    const fallback = `Erreur API (${response.status})`;
    try {
      const body = await response.json();
      const message = extractApiMessage(body, fallback);
      if (verifySucceeded && (await verifySucceeded())) {
        return { ok: true };
      }
      return { ok: false, message };
    } catch {
      if (verifySucceeded && (await verifySucceeded())) {
        return { ok: true };
      }
      return { ok: false, message: fallback };
    }
  } catch (error) {
    if (verifySucceeded) {
      try {
        if (await verifySucceeded()) return { ok: true };
      } catch {
        // ignore verification errors
      }
    }
    const message =
      error instanceof Error ? error.message : "Impossible de joindre l'API.";
    return { ok: false, message };
  }
}

export async function adminDelete(
  path: string,
  verifyDeleted?: () => Promise<boolean>,
): Promise<AdminDeleteResult> {
  try {
    const response = await adminFetch(path, { method: "DELETE" });
    if (response.ok) return { ok: true };

    const fallback = `Erreur API (${response.status})`;
    try {
      const body = await response.json();
      const message = extractApiMessage(body, fallback);
      if (verifyDeleted && (await verifyDeleted())) {
        return { ok: true };
      }
      return { ok: false, message };
    } catch {
      if (verifyDeleted && (await verifyDeleted())) {
        return { ok: true };
      }
      return { ok: false, message: fallback };
    }
  } catch (error) {
    if (verifyDeleted) {
      try {
        if (await verifyDeleted()) return { ok: true };
      } catch {
        // ignore verification errors
      }
    }
    const message =
      error instanceof Error ? error.message : "Impossible de joindre l'API.";
    return { ok: false, message };
  }
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
