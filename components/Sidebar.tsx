"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Settings,
  LogOut,
  Building2,
  ShieldCheck,
  Database,
  Server,
} from "lucide-react";
import clsx from "clsx";
import BrandLogo from "@/components/BrandLogo";

export default function Sidebar() {
  const pathname = usePathname();
  const [env, setEnv] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("municipall_env") || "PROD";
    }
    return "PROD";
  });

  const setEnvironment = (newEnv: string) => {
    setEnv(newEnv);
    localStorage.setItem("municipall_env", newEnv);
    window.location.reload();
  };

  const menuItems = [
    { id: "dashboard", label: "Vue d'ensemble", icon: LayoutDashboard, href: "/" },
    { id: "database", label: "Base de données", icon: Database, href: "/database" },
    { id: "monitoring", label: "État du serveur", icon: ShieldCheck, href: "/monitoring" },
    { id: "users", label: "Utilisateurs", icon: Users, href: "/users" },
    { id: "agents", label: "Agents", icon: UserPlus, href: "/agents" },
    { id: "cities", label: "Villes partenaires", icon: Building2, href: "/cities" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("admin_authorized");
    window.location.reload();
  };

  const envColors: Record<string, string> = {
    PROD: "bg-municipall-blue",
    DEV: "bg-amber-500",
    LOCAL: "bg-slate-600",
  };

  return (
    <aside className="z-30 flex h-screen w-[260px] shrink-0 flex-col border-r border-slate-200/80 bg-white shadow-sidebar">
      <div className="flex flex-col gap-1 p-5">
        <Link href="/" className="mb-6 flex items-center gap-3 rounded-xl p-1 transition-opacity hover:opacity-90">
          <BrandLogo size="md" />
          <div className="min-w-0">
            <h1 className="text-[15px] font-semibold leading-tight text-slate-900">
              Municip&apos;All Panel
            </h1>
            <p className="text-[11px] font-medium text-slate-500">Administration interne</p>
          </div>
        </Link>

        <nav className="space-y-0.5" aria-label="Navigation principale">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all outline-none",
                  isActive
                    ? "bg-municipall-blue/[0.08] text-municipall-blue"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon
                  className={clsx(
                    "h-[18px] w-[18px] shrink-0",
                    isActive ? "text-municipall-blue" : "text-slate-400"
                  )}
                  strokeWidth={isActive ? 2.25 : 2}
                />
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-municipall-blue" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto space-y-3 border-t border-slate-100 p-5">
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5">
          <div className="mb-2.5 flex items-center gap-2">
            <Server className="h-3.5 w-3.5 text-slate-400" />
            <span className="section-title">Environnement</span>
          </div>
          <div className="flex gap-1 rounded-lg bg-white p-1 ring-1 ring-slate-200/80">
            {(["PROD", "DEV", "LOCAL"] as const).map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEnvironment(e)}
                className={clsx(
                  "flex-1 rounded-md py-1.5 text-[10px] font-bold tracking-wide transition-all",
                  env === e
                    ? clsx(envColors[e], "text-white shadow-sm")
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-0.5">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <Settings className="h-[18px] w-[18px] text-slate-400" />
            Paramètres
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Déconnexion
          </button>
        </div>
      </div>
    </aside>
  );
}
