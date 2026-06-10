"use client";

import React from "react";
import Link from "next/link";
import { ShieldOff } from "lucide-react";
import { usePanelRole } from "@/context/PanelRoleContext";
import { panelRoleLabel } from "@/lib/platformRoles";
import type { PanelPermission } from "@/lib/panelPermissions";
import PageShell from "@/components/PageShell";

type RequirePermissionProps = {
  permission: PanelPermission;
  children: React.ReactNode;
};

export default function RequirePermission({
  permission,
  children,
}: RequirePermissionProps) {
  const { role, can } = usePanelRole();

  if (can(permission)) {
    return <>{children}</>;
  }

  return (
    <PageShell>
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <ShieldOff className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Accès restreint</h1>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          Votre profil{" "}
          <span className="font-semibold text-slate-700">
            {role ? panelRoleLabel(role) : "—"}
          </span>{" "}
          n&apos;a pas les droits pour cette section.
        </p>
        <Link href="/" className="btn-primary mt-6">
          Retour au tableau de bord
        </Link>
      </div>
    </PageShell>
  );
}
