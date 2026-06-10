import type { PanelRole } from "@/lib/platformRoles";

export const PanelPermission = {
  DASHBOARD: "dashboard",
  DASHBOARD_INFRA: "dashboard:infra",
  USERS_VIEW: "users:view",
  USERS_EDIT: "users:edit",
  USERS_DELETE: "users:delete",
  AGENTS: "agents",
  CITIES_VIEW: "cities:view",
  CITIES_EDIT: "cities:edit",
  DATABASE: "database",
  MONITORING: "monitoring",
  ENV_SWITCH: "env:switch",
} as const;

export type PanelPermission =
  (typeof PanelPermission)[keyof typeof PanelPermission];

const ALL: PanelPermission[] = Object.values(PanelPermission);

const ROLE_PERMISSIONS: Record<PanelRole, PanelPermission[]> = {
  chief: ALL,
  tech: [
    PanelPermission.DASHBOARD,
    PanelPermission.DASHBOARD_INFRA,
    PanelPermission.USERS_VIEW,
    PanelPermission.USERS_EDIT,
    PanelPermission.USERS_DELETE,
    PanelPermission.AGENTS,
    PanelPermission.CITIES_VIEW,
    PanelPermission.DATABASE,
    PanelPermission.MONITORING,
    PanelPermission.ENV_SWITCH,
  ],
  sales: [
    PanelPermission.DASHBOARD,
    PanelPermission.USERS_VIEW,
    PanelPermission.AGENTS,
    PanelPermission.CITIES_VIEW,
    PanelPermission.CITIES_EDIT,
  ],
  support: [
    PanelPermission.DASHBOARD,
    PanelPermission.USERS_VIEW,
    PanelPermission.USERS_EDIT,
    PanelPermission.AGENTS,
    PanelPermission.CITIES_VIEW,
  ],
};

export function roleHasPermission(
  role: PanelRole,
  permission: PanelPermission,
): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export type NavItemId =
  | "dashboard"
  | "database"
  | "monitoring"
  | "users"
  | "agents"
  | "cities";

export const NAV_PERMISSIONS: Record<NavItemId, PanelPermission> = {
  dashboard: PanelPermission.DASHBOARD,
  database: PanelPermission.DATABASE,
  monitoring: PanelPermission.MONITORING,
  users: PanelPermission.USERS_VIEW,
  agents: PanelPermission.AGENTS,
  cities: PanelPermission.CITIES_VIEW,
};
