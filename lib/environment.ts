export const ENV_STORAGE_KEY = "municipall_env";
/** Lu par `proxy.ts` pour router les appels `/api/admin/*` vers dev ou prod. */
export const ENV_COOKIE_KEY = "admin_env";

export type AdminEnvironment = "DEV" | "PROD";

export const ADMIN_ENVIRONMENTS: AdminEnvironment[] = ["DEV", "PROD"];

export const DEFAULT_ADMIN_ENVIRONMENT: AdminEnvironment = "DEV";

export const PROD_SWITCH_CONFIRM = {
  title: "Passer en production",
  description: "Environnement sensible",
  confirmLabel: "Oui, passer en PROD",
  cancelLabel: "Annuler",
  message:
    "Vous êtes sur le point de passer en environnement PRODUCTION. Toutes les actions (villes, utilisateurs, base de données, etc.) impacteront les données réelles et peuvent provoquer de graves problèmes sur l'application en ligne.",
  question: "Êtes-vous vraiment sûr de vouloir continuer ?",
} as const;

/** Normalise une valeur stockée (ex. ancien LOCAL → DEV). */
export function normalizeAdminEnvironment(
  value: string | null,
): AdminEnvironment {
  if (value === "PROD") return "PROD";
  return DEFAULT_ADMIN_ENVIRONMENT;
}

export function getStoredAdminEnvironment(): AdminEnvironment {
  if (typeof window === "undefined") {
    return DEFAULT_ADMIN_ENVIRONMENT;
  }
  return normalizeAdminEnvironment(localStorage.getItem(ENV_STORAGE_KEY));
}

function writeAdminEnvironmentCookie(env: AdminEnvironment): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${ENV_COOKIE_KEY}=${env}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax${secure}`;
}

/** Aligne le cookie `admin_env` sur localStorage (lu par le proxy serveur). */
export function syncAdminEnvironmentCookie(): void {
  writeAdminEnvironmentCookie(getStoredAdminEnvironment());
}

export function setStoredAdminEnvironment(env: AdminEnvironment): void {
  localStorage.setItem(ENV_STORAGE_KEY, env);
  writeAdminEnvironmentCookie(env);
}

export const DEV_API_FALLBACK = "https://dev.api.municipall.dev";
export const PROD_API_FALLBACK = "https://api.municipall.dev";

export function getApiBaseUrlForEnvironment(env: AdminEnvironment): string {
  if (env === "DEV") {
    return process.env.NEXT_PUBLIC_API_URL_DEV || DEV_API_FALLBACK;
  }
  return process.env.NEXT_PUBLIC_API_URL || PROD_API_FALLBACK;
}
