export const ROLE_OPTIONS = [
  { value: "mayor", label: "Maire" },
  { value: "assistant", label: "Assistant / conseiller" },
  { value: "agent", label: "Agent" },
  { value: "citizen", label: "Citoyen" },
] as const;

export function roleLabel(role: string): string {
  const n = role.trim().toLowerCase();
  const match = ROLE_OPTIONS.find((r) => r.value === n);
  if (match) return match.label;
  if (n === "citoyen") return "Citoyen";
  if (n === "maire") return "Maire";
  return role;
}

export function roleBadgeClass(role: string): string {
  const n = role.trim().toLowerCase();
  if (n === "mayor" || n === "maire") {
    return "bg-emerald-50 text-emerald-700";
  }
  if (n === "assistant" || n === "conseiller") {
    return "bg-indigo-50 text-indigo-700";
  }
  if (n === "agent" || n.startsWith("agent")) {
    return "bg-municipall-blue/10 text-municipall-blue";
  }
  return "bg-slate-100 text-slate-600";
}
