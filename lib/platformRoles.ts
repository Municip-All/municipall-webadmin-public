export type PanelRole = "chief" | "tech" | "sales" | "support";

export const PANEL_ROLE_STORAGE_KEY = "admin_panel_role";

export const PANEL_ROLES: {
  id: PanelRole;
  label: string;
  description: string;
}[] = [
  {
    id: "chief",
    label: "Direction",
    description: "Vue globale — accès complet au panel",
  },
  {
    id: "tech",
    label: "Équipe Tech",
    description: "Infrastructure, base de données, monitoring",
  },
  {
    id: "sales",
    label: "Équipe Sales",
    description: "Villes partenaires, croissance, contrats",
  },
  {
    id: "support",
    label: "Équipe Support",
    description: "Comptes utilisateurs, agents, assistance",
  },
];

export function panelRoleLabel(role: PanelRole): string {
  return PANEL_ROLES.find((r) => r.id === role)?.label ?? role;
}

export function isPanelRole(value: string | null): value is PanelRole {
  return (
    value === "chief" ||
    value === "tech" ||
    value === "sales" ||
    value === "support"
  );
}

export function getStoredPanelRole(): PanelRole | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PANEL_ROLE_STORAGE_KEY);
  return isPanelRole(raw) ? raw : null;
}

export function setStoredPanelRole(role: PanelRole): void {
  localStorage.setItem(PANEL_ROLE_STORAGE_KEY, role);
}

export function clearStoredPanelRole(): void {
  localStorage.removeItem(PANEL_ROLE_STORAGE_KEY);
}
