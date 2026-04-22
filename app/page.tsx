"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Users, 
  UserCircle2, 
  Heart, 
  ArrowUpRight, 
  ArrowDownRight,
  Search,
  Cpu,
  Activity,
  HardDrive,
  Zap,
  RefreshCcw
} from "lucide-react";
import clsx from "clsx";
import StatCard from "@/components/StatCard";
import { api, MonitoringStats } from "@/lib/api";

export default function Dashboard() {
  const [stats, setStats] = useState<MonitoringStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const data = await api.getStats();
      if (data) {
        setStats(data);
        setLastUpdated(new Date());
      }
    } finally {
      setIsLoading(false);
    }
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

  return (
    <div className="p-8">
      <header className="mb-10 flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Tableau de Bord</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <p>Données en temps réel du réseau Municip&apos;All.</p>
            <span className="text-gray-300">•</span>
            <div className="flex items-center gap-1.5">
              <RefreshCcw className={clsx("w-3.5 h-3.5", isLoading && "animate-spin")} />
              Mise à jour : {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-municipall-blue transition-colors" />
            <input 
              type="text" 
              placeholder="Rechercher une ville..."
              className="pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-municipall-blue/10 focus:border-municipall-blue/20 transition-all shadow-sm w-64"
            />
          </div>
          <button onClick={fetchStats} className="p-2 bg-white border border-gray-100 rounded-xl text-gray-500 hover:text-gray-900 transition-colors shadow-sm">
            <RefreshCcw className={clsx("w-5 h-5", isLoading && "animate-spin")} />
          </button>
        </div>
      </header>

      {/* Stats Grid - Solution Business */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          title="Villes Partenaires"
          value={stats?.business.cities || "..."}
          change="Live"
          isPositive={true}
          icon={Building2}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard 
          title="Citoyens Inscrits"
          value={stats?.business.citizens.toLocaleString() || "..."}
          change="Global"
          isPositive={true}
          icon={Users}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <StatCard 
          title="Agents Municipaux"
          value={stats?.business.agents.toLocaleString() || "..."}
          change="Vérifiés"
          isPositive={true}
          icon={UserCircle2}
          iconBg="bg-green-50"
          iconColor="text-green-600"
        />
        <StatCard 
          title="Satisfaction Moyenne"
          value={`${stats?.business.satisfaction || "4.8"}/5`}
          change="Calculé"
          isPositive={true}
          icon={Heart}
          iconBg="bg-red-50"
          iconColor="text-red-600"
        />
      </div>

      {/* Monitoring Section */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-amber-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Monitoring Système (VPS)</h3>
          <span className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded-full border border-green-100 uppercase tracking-wider animate-pulse">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            Live
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card-panel p-5 bg-gray-900 text-white border-none shadow-xl shadow-gray-200">
            <div className="flex justify-between items-start mb-4">
              <Cpu className="w-6 h-6 text-indigo-400" />
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Load Average</span>
            </div>
            <h4 className="text-2xl font-bold mb-1">{stats?.system.cpu.load || 0}%</h4>
            <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mt-3">
              <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${stats?.system.cpu.load || 0}%` }}></div>
            </div>
          </div>

          <div className="card-panel p-5 bg-gray-900 text-white border-none shadow-xl shadow-gray-200">
            <div className="flex justify-between items-start mb-4">
              <Activity className="w-6 h-6 text-green-400" />
              <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">RAM Usage</span>
            </div>
            <h4 className="text-2xl font-bold mb-1">{stats?.system.memory.used || 0} GB / {stats?.system.memory.total || 0} GB</h4>
            <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mt-3">
              <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${stats?.system.memory.percentage || 0}%` }}></div>
            </div>
          </div>

          <div className="card-panel p-5 bg-gray-900 text-white border-none shadow-xl shadow-gray-200">
            <div className="flex justify-between items-start mb-4">
              <HardDrive className="w-6 h-6 text-blue-400" />
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Uptime</span>
            </div>
            <h4 className="text-2xl font-bold mb-1">{stats ? Math.floor(stats.system.uptime / 3600) : 0} <span className="text-xs font-medium text-gray-400">heures</span></h4>
            <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mt-3">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="card-panel p-5 bg-gray-900 text-white border-none shadow-xl shadow-gray-200">
            <div className="flex justify-between items-start mb-4">
              <Zap className="w-6 h-6 text-amber-400" />
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Platform</span>
            </div>
            <h4 className="text-2xl font-bold mb-1 uppercase">{stats?.system.platform || "..."}</h4>
            <div className="flex gap-1 items-end h-6 mt-2">
              {[3, 5, 2, 8, 4, 6, 9, 5, 7].map((v, i) => (
                <div key={i} className="flex-1 bg-amber-500/20 rounded-sm" style={{ height: `${v * 10}%` }}></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card-panel p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-gray-900">Activité des Villes</h3>
              <select className="bg-gray-50 border-none text-xs font-bold text-gray-500 rounded-lg px-3 py-1.5 focus:ring-0">
                <option>7 derniers jours</option>
                <option>30 derniers jours</option>
              </select>
            </div>
            
            <div className="h-64 flex items-end justify-between gap-2">
              {[65, 45, 75, 55, 90, 65, 80].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div 
                    className="w-full bg-indigo-50 group-hover:bg-municipall-blue transition-colors rounded-lg relative overflow-hidden"
                    style={{ height: `${h}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">Jour {i+1}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-panel p-6">
              <h3 className="text-base font-bold text-gray-900 mb-6">Top Villes (Satisfaction)</h3>
              <div className="space-y-4">
                {[
                  { name: "Bouffémont", score: "4.9", trend: "up" },
                  { name: "Domont", score: "4.8", trend: "up" },
                  { name: "Ézanville", score: "4.7", trend: "down" },
                ].map((city, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-gray-100/50">
                    <span className="text-sm font-bold text-gray-700">{city.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-gray-900">{city.score}</span>
                      {city.trend === "up" ? (
                        <ArrowUpRight className="w-3 h-3 text-green-500" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-panel p-6">
              <h3 className="text-base font-bold text-gray-900 mb-6">Répartition Utilisateurs</h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-gray-500">
                    <span>Citoyens</span>
                    <span>92%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-municipall-blue rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-gray-500">
                    <span>Agents</span>
                    <span>7%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-municipall-indigo rounded-full" style={{ width: '7%' }}></div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-gray-500">
                    <span>Super Admins</span>
                    <span>1%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-900 rounded-full" style={{ width: '1%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Activity */}
        <div className="space-y-8">
          <div className="card-panel p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Activité Récente</h3>
            <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-100">
              {[
                { type: "city", text: "Nouvelle ville : Bouffémont", time: "Il y a 2h" },
                { type: "user", text: "1,200 citoyens inscrits (Cergy)", time: "Il y a 5h" },
                { type: "agent", text: "Agent 'Jean D.' ajouté à Domont", time: "Il y a 8h" },
                { type: "alert", text: "Alerte système : Charge élevée", time: "Hier" },
              ].map((activity, idx) => (
                <div key={idx} className="flex gap-4 relative z-10">
                  <div className={clsx(
                    "w-[23px] h-[23px] rounded-full border-4 border-white shadow-sm flex items-center justify-center",
                    activity.type === "city" ? "bg-blue-500" : 
                    activity.type === "user" ? "bg-green-500" : 
                    activity.type === "agent" ? "bg-indigo-500" : "bg-red-500"
                  )}></div>
                  <div>
                    <p className="text-xs font-bold text-gray-800 leading-snug">{activity.text}</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-wide">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-2 text-xs font-bold text-municipall-blue hover:text-municipall-indigo transition-colors border border-indigo-50 rounded-lg hover:bg-indigo-50/50">
              Voir tout l&apos;historique
            </button>
          </div>

          <div className="bg-municipall-blue rounded-2xl p-6 text-white shadow-xl shadow-municipall-blue/20 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2">Besoin d&apos;aide ?</h3>
              <p className="text-xs text-white/70 leading-relaxed mb-4">L&apos;équipe technique est à votre disposition pour toute intervention sur les instances villes.</p>
              <button className="px-4 py-2 bg-white text-municipall-blue text-xs font-bold rounded-lg hover:bg-indigo-50 transition-colors">
                Contacter le support
              </button>
            </div>
            <Building2 className="absolute -bottom-4 -right-4 w-24 h-24 text-white/5 rotate-12" />
          </div>
        </div>
      </div>
    </div>
  );
}
