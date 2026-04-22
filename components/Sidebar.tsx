"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Settings, 
  LogOut,
  Building2,
  ShieldCheck
} from "lucide-react";
import clsx from "clsx";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { id: "dashboard", label: "Vue d'ensemble", icon: LayoutDashboard, href: "/" },
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
      <div className="p-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-municipall-blue rounded-xl flex items-center justify-center shadow-lg shadow-municipall-blue/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Master Panel</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Internal Only</p>
          </div>
        </div>

        <nav className="space-y-1.5">
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
      </div>

      <div className="mt-auto p-6 border-t border-gray-50 space-y-2">
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
    </aside>
  );
}
