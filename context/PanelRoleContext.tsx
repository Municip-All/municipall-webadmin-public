"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  getStoredPanelRole,
  setStoredPanelRole,
  type PanelRole,
} from "@/lib/platformRoles";
import {
  type PanelPermission,
  roleHasPermission,
} from "@/lib/panelPermissions";

type PanelRoleContextValue = {
  role: PanelRole | null;
  setRole: (role: PanelRole) => void;
  can: (permission: PanelPermission) => boolean;
};

const PanelRoleContext = createContext<PanelRoleContextValue | null>(null);

export function PanelRoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<PanelRole | null>(() =>
    typeof window !== "undefined" ? getStoredPanelRole() : null,
  );

  const setRole = useCallback((next: PanelRole) => {
    setStoredPanelRole(next);
    setRoleState(next);
  }, []);

  const can = useCallback(
    (permission: PanelPermission) => {
      if (!role) return false;
      return roleHasPermission(role, permission);
    },
    [role],
  );

  const value = useMemo(
    () => ({ role, setRole, can }),
    [role, setRole, can],
  );

  return (
    <PanelRoleContext.Provider value={value}>{children}</PanelRoleContext.Provider>
  );
}

export function usePanelRole() {
  const ctx = useContext(PanelRoleContext);
  if (!ctx) {
    throw new Error("usePanelRole must be used within PanelRoleProvider");
  }
  return ctx;
}
