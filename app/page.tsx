"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Users,
  UserCircle2,
  Heart,
  Search,
  Cpu,
  Activity,
  HardDrive,
  Zap,
  RefreshCcw,
} from "lucide-react";
import clsx from "clsx";
import StatCard from "@/components/StatCard";
import PageHeader from "@/components/PageHeader";
import PageShell from "@/components/PageShell";
import Badge from "@/components/Badge";
import SystemMetricCard from "@/components/SystemMetricCard";
import {
  api,
  MonitoringStats,
  Activity as ActivityLog,
  CityStats,
} from "@/lib/api";
import { usePanelRole } from "@/context/PanelRoleContext";
import { PanelPermission } from "@/lib/panelPermissions";
import { panelRoleLabel, type PanelRole } from "@/lib/platformRoles";
import Link from "next/link";

const ROLE_FOCUS: Record<PanelRole, string> = {
  chief: "Vue globale — pilotage du réseau Municip'All",
  tech: "Infrastructure, comptes et maintenance technique",
  sales: "Croissance commerciale et villes partenaires",
  support: "Assistance citoyens, agents et comptes",
};

export default function Dashboard() {
  const { role, can } = usePanelRole();
  const showInfra = can(PanelPermission.DASHBOARD_INFRA);
  const [stats, setStats] = useState<MonitoringStats | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [cityStats, setCityStats] = useState<CityStats[]>([]);
  const [citySearch, setCitySearch] = useState("");

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const [statsData, activityData, cityStatsData] = await Promise.all([
        api.getStats(),
        api.getActivity(),
        api.getCityStats(),
      ]);

      if (statsData) setStats(statsData);
      if (activityData) setActivities(activityData);
      if (cityStatsData)
        setCityStats(
          cityStatsData.sort((a, b) => b.users - a.users).slice(0, 3),
        );
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCityStats = cityStats.filter((c) =>
    c.name.toLowerCase().includes(citySearch.toLowerCase()),
  );

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return "À l'instant";
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
    return date.toLocaleDateString("fr-FR");
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStats().catch(console.error);
    }, 0);

    const interval = setInterval(() => {
      fetchStats().catch(console.error);
    }, 30000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const citizens = stats?.business.citizens ?? 0;
  const agents = stats?.business.agents ?? 0;
  const userTotal = citizens + agents;
  const distribution = userTotal
    ? [
        {
          label: "Citoyens",
          pct: Math.round((citizens / userTotal) * 100),
          color: "bg-municipall-blue",
        },
        {
          label: "Agents & élus",
          pct: Math.round((agents / userTotal) * 100),
          color: "bg-municipall-indigo",
        },
      ]
    : [];

  return (
    <PageShell>
      <PageHeader
        title="Vue d'ensemble"
        description={
          <span className="flex flex-wrap items-center gap-2">
            {role ? ROLE_FOCUS[role] : "Données en temps réel du réseau Municip'All"}
            {role && (
              <>
                <span className="text-slate-300">·</span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                  {panelRoleLabel(role)}
                </span>
              </>
            )}
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1.5 text-slate-500">
              <RefreshCcw
                className={clsx("h-3.5 w-3.5", isLoading && "animate-spin")}
              />
              {lastUpdated.toLocaleTimeString("fr-FR")}
            </span>
          </span>
        }
        actions={
          <>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher une ville…"
                className="input-field w-56 pl-9"
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={fetchStats}
              className="btn-secondary !px-3"
              aria-label="Actualiser"
            >
              <RefreshCcw
                className={clsx("h-4 w-4", isLoading && "animate-spin")}
              />
            </button>
          </>
        }
      />

      <section className="mb-10">
        <h2 className="section-title mb-4">Indicateurs clés</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Villes partenaires"
            value={stats?.business.cities ?? "—"}
            change="Live"
            icon={Building2}
          />
          <StatCard
            title="Citoyens inscrits"
            value={stats?.business.citizens.toLocaleString("fr-FR") ?? "—"}
            change="Global"
            icon={Users}
          />
          <StatCard
            title="Agents municipaux"
            value={stats?.business.agents.toLocaleString("fr-FR") ?? "—"}
            change="Vérifiés"
            icon={UserCircle2}
          />
          <StatCard
            title="Satisfaction moyenne"
            value={`${stats?.business.satisfaction ?? "4.8"}/5`}
            change="Calculé"
            icon={Heart}
          />
        </div>
      </section>

      {showInfra && (
        <section className="mb-10">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <h2 className="section-title">Infrastructure VPS</h2>
            <Badge variant="live" dot>
              Live
            </Badge>
            {can(PanelPermission.MONITORING) && (
              <Link
                href="/monitoring"
                className="text-xs font-semibold text-municipall-blue hover:underline"
              >
                Voir le détail →
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SystemMetricCard
              label="Charge CPU"
              value={`${stats?.system.cpu.load ?? 0}%`}
              icon={Cpu}
              progress={stats?.system.cpu.load ?? 0}
              accent="brand"
            />
            <SystemMetricCard
              label="Mémoire"
              value={`${stats?.system.memory.used ?? 0} / ${stats?.system.memory.total ?? 0} Go`}
              icon={Activity}
              progress={stats?.system.memory.percentage ?? 0}
              accent="emerald"
            />
            <SystemMetricCard
              label="Uptime"
              value={
                <>
                  {stats ? Math.floor(stats.system.uptime / 3600) : 0}
                  <span className="ml-1 text-sm font-medium text-slate-500">
                    h
                  </span>
                </>
              }
              icon={HardDrive}
              accent="sky"
            />
            <SystemMetricCard
              label="Plateforme"
              value={(stats?.system.platform ?? "—").toString()}
              icon={Zap}
              accent="amber"
            />
          </div>
        </section>
      )}

      {!showInfra && role === "sales" && (
        <section className="mb-10">
          <h2 className="section-title mb-4">Accès rapides Sales</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              href="/cities"
              className="card-panel flex items-center gap-4 p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-municipall-blue/[0.08] text-municipall-blue">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Villes partenaires</p>
                <p className="text-xs text-slate-500">
                  Contrats, options et déploiement
                </p>
              </div>
            </Link>
            <Link
              href="/users"
              className="card-panel flex items-center gap-4 p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Comptes utilisateurs</p>
                <p className="text-xs text-slate-500">
                  Consultation des inscriptions
                </p>
              </div>
            </Link>
          </div>
        </section>
      )}

      {!showInfra && role === "support" && (
        <section className="mb-10">
          <h2 className="section-title mb-4">Accès rapides Support</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              href="/users"
              className="card-panel flex items-center gap-4 p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-municipall-blue/[0.08] text-municipall-blue">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Gérer les comptes</p>
                <p className="text-xs text-slate-500">
                  Modifier rôles, communes, mots de passe
                </p>
              </div>
            </Link>
            <Link
              href="/agents"
              className="card-panel flex items-center gap-4 p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <UserCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Invitations agents</p>
                <p className="text-xs text-slate-500">
                  Onboarding des équipes mairie
                </p>
              </div>
            </Link>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card-panel p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">
                Activité des villes
              </h3>
              <select className="rounded-lg border-0 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 focus:ring-2 focus:ring-municipall-blue/20">
                <option>7 derniers jours</option>
                <option>30 derniers jours</option>
              </select>
            </div>
            <div className="flex h-52 items-end justify-between gap-2">
              {/* TODO: replace placeholder data with real API endpoint for city activity */}
              {[65, 45, 75, 55, 90, 65, 80].map((h, i) => (
                <div
                  key={i}
                  className="group flex flex-1 flex-col items-center gap-2"
                >
                  <div
                    className="w-full rounded-lg bg-municipall-blue/[0.08] transition-colors group-hover:bg-municipall-blue/20"
                    style={{ height: `${h}%` }}
                  />
                  <span className="text-[10px] font-medium text-slate-400">
                    J{i + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="card-panel p-6">
              <h3 className="mb-4 text-sm font-semibold text-slate-900">
                Top villes (citoyens)
              </h3>
              <div className="space-y-2">
                {filteredCityStats.length > 0 ? (
                  filteredCityStats.map((city, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100"
                    >
                      <span className="text-sm font-medium text-slate-700">
                        {city.name}
                      </span>
                      <span className="text-sm font-semibold tabular-nums text-slate-900">
                        {city.users}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="py-6 text-center text-sm text-slate-400">
                    Aucune donnée disponible
                  </p>
                )}
              </div>
            </div>

            <div className="card-panel p-6">
              <h3 className="mb-4 text-sm font-semibold text-slate-900">
                Répartition utilisateurs
              </h3>
              <div className="space-y-4">
                {distribution.length > 0 ? (
                  distribution.map((row) => (
                    <div key={row.label} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium text-slate-500">
                        <span>{row.label}</span>
                        <span>{row.pct}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={clsx("h-full rounded-full", row.color)}
                          style={{ width: `${row.pct}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-6 text-center text-sm text-slate-400">
                    Aucune donnée disponible
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card-panel p-6">
            <h3 className="mb-5 text-sm font-semibold text-slate-900">
              Activité récente
            </h3>
            <div className="relative space-y-5 pl-1 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-slate-200">
              {activities.length > 0 ? (
                activities.map((activity, idx) => (
                  <div key={idx} className="relative z-10 flex gap-3">
                    <div
                      className={clsx(
                        "mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full ring-2 ring-white",
                        activity.type === "city"
                          ? "bg-sky-500"
                          : activity.type === "user"
                            ? "bg-emerald-500"
                            : activity.type === "agent"
                              ? "bg-municipall-indigo"
                              : "bg-red-500",
                      )}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-medium leading-snug text-slate-800">
                        {activity.text}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {formatTime(activity.time)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-sm text-slate-400">
                  Aucune activité récente
                </p>
              )}
            </div>
            <button
              type="button"
              className="btn-ghost mt-5 w-full cursor-not-allowed text-slate-400"
              disabled
            >
              Voir tout l&apos;historique
            </button>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-municipall-blue p-6 text-white shadow-premium">
            <h3 className="text-sm font-semibold">Besoin d&apos;aide ?</h3>
            <p className="mt-2 text-xs leading-relaxed text-white/75">
              L&apos;équipe technique intervient sur les instances villes et
              l&apos;infrastructure.
            </p>
            <button
              type="button"
              className="mt-4 cursor-not-allowed rounded-lg bg-white/60 px-4 py-2 text-xs font-semibold text-municipall-blue/50"
              disabled
            >
              Contacter le support
            </button>
            <Building2 className="pointer-events-none absolute -bottom-3 -right-3 h-20 w-20 rotate-12 text-white/[0.06]" />
          </div>
        </div>
      </div>
    </PageShell>
  );
}
