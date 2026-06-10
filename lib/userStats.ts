import type { User } from "@/lib/api";

export type UserKpis = {
  total: number;
  citizens: number;
  staff: number;
  mayors: number;
  withoutCity: number;
  newThisMonth: number;
};

function normalizeRole(role: string): string {
  return role.trim().toLowerCase();
}

function isCitizen(role: string): boolean {
  const n = normalizeRole(role);
  return n === "citizen" || n === "citoyen";
}

function isStaff(role: string): boolean {
  const n = normalizeRole(role);
  return n === "mayor" || n === "maire" || n === "assistant" || n === "agent";
}

function isMayor(role: string): boolean {
  const n = normalizeRole(role);
  return n === "mayor" || n === "maire";
}

export function computeUserKpis(users: User[]): UserKpis {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  return {
    total: users.length,
    citizens: users.filter((u) => isCitizen(u.role)).length,
    staff: users.filter((u) => isStaff(u.role)).length,
    mayors: users.filter((u) => isMayor(u.role)).length,
    withoutCity: users.filter((u) => !u.cityId?.trim()).length,
    newThisMonth: users.filter((u) => {
      if (!u.created_at) return false;
      return new Date(u.created_at) >= monthStart;
    }).length,
  };
}
