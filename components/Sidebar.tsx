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
} from "lucide-react";
import clsx from "clsx";

export default function Sidebar() {
  const pathname = usePathname();
  const [env, setEnv] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("municipall_env") || "PROD";
    }
    return "PROD";
  });

  const toggleEnv = () => {
    const envs = ["PROD", "DEV", "LOCAL"];
    const currentIndex = envs.indexOf(env);
    const nextIndex = (currentIndex + 1) % envs.length;
    const newEnv = envs[nextIndex];
    setEnv(newEnv);
    localStorage.setItem("municipall_env", newEnv);
    window.location.reload();
  };

  const menuItems = [
    { id: "dashboard", label: "Vue d'ensemble", icon: LayoutDashboard, href: "/" },
    { id: "database", label: "Base de Données", icon: Database, href: "/database" },
    { id: "monitoring", label: "État du Serveur", icon: ShieldCheck, href: "/monitoring" },
    { id: "users", label: "Tous les Utilisateurs", icon: Users, href: "/users" },
    { id: "agents", label: "Gestion des Agents", icon: UserPlus, href: "/agents" },
    { id: "cities", label: "Villes Partenaires", icon: Building2, href: "/cities" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("admin_authorized");
    window.location.reload();
  };

  return (
    <aside className="w-72 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0 z-30">
      <div className="p-8 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-municipall-blue rounded-xl flex items-center justify-center shadow-lg shadow-municipall-blue/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Master Panel</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Internal Only</p>
          </div>
        </div>

        <nav className="space-y-1.5 flex-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group outline-none",
                  isActive 
                    ? "bg-indigo-50 text-municipall-blue shadow-sm" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className={clsx(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-municipall-blue" : "text-gray-400 group-hover:text-gray-600"
                )} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-4 pt-6 border-t border-gray-50">
          {/* Environment Switcher */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Database className="w-4 h-4 text-gray-400" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Environnement</span>
            </div>
            <div className="flex p-1 bg-white rounded-xl border border-gray-100 relative">
              {["PROD", "DEV", "LOCAL"].map((e) => (
                <button 
                  key={e}
                  onClick={toggleEnv}
                  className={clsx(
                    "flex-1 py-1.5 text-[9px] font-black rounded-lg transition-all z-10",
                    env === e ? "text-white" : "text-gray-400"
                  )}
                >
                  {e}
                </button>
              ))}
              <div 
                className={clsx(
                  "absolute top-1 bottom-1 w-[calc(33.33%-4px)] bg-municipall-blue rounded-lg transition-all duration-300",
                  env === "PROD" ? "left-1" : env === "DEV" ? "left-[calc(33.33%+1px)]" : "left-[calc(66.66%+1px)]"
                )}
              ></div>
            </div>
          </div>

          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all outline-none">
              <Settings className="w-5 h-5 text-gray-400" />
              Paramètres Système
            </button>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all outline-none"
            >
              <LogOut className="w-5 h-5" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
