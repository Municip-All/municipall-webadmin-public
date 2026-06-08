import { getApiBaseUrl } from "./environment";

function getPlatformAdminKey(): string {
  return process.env.NEXT_PUBLIC_PLATFORM_ADMIN_KEY?.trim() ?? "";
}

export function assertPlatformAdminKeyConfigured(): void {
  if (typeof window === "undefined") return;
  if (!getPlatformAdminKey()) {
    console.warn(
      "[Municipall WebAdmin] NEXT_PUBLIC_PLATFORM_ADMIN_KEY est vide. " +
        "Ajoutez-la dans .env puis redémarrez le serveur Next.js.",
    );
  }
}

export async function adminFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const key = getPlatformAdminKey();
  return fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(key ? { "x-platform-admin-key": key } : {}),
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

    if (response.status === 403 && !getPlatformAdminKey()) {
      throw new Error(
        "Clé plateforme manquante côté WebAdmin (NEXT_PUBLIC_PLATFORM_ADMIN_KEY dans .env).",
      );
    }

    throw new Error(message);
  }

  if (typeof body === "object" && body !== null && "data" in body) {
    return (body as { data: T }).data;
  }

  return body as T;
}
