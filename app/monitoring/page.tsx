"use client";

import React, { useState, useEffect } from "react";
import { 
  Box, 
  Activity, 
  Cpu, 
  RefreshCcw, 
  CheckCircle2, 
  XCircle,
  Clock,
  HardDrive
} from "lucide-react";
import clsx from "clsx";
import { api } from "@/lib/api";

export default function MonitoringPage() {
  const [containers, setContainers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchContainers = async () => {
    setIsLoading(true);
    const data = await api.getDockerContainers();
    if (data) {
      setContainers(data);
      setLastUpdated(new Date());
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchContainers();
    const interval = setInterval(fetchContainers, 15000); // Refresh every 15s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8">
      <header className="mb-10 flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Monitoring Docker</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <p>État des conteneurs sur le VPS Municip&apos;All.</p>
            <span className="text-gray-300">•</span>
            <div className="flex items-center gap-1.5">
              <RefreshCcw className={clsx("w-3.5 h-3.5", isLoading && "animate-spin")} />
              Mise à jour : {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        </div>
        
        <button 
          onClick={fetchContainers}
          className="btn-primary"
        >
          <RefreshCcw className={clsx("w-5 h-5", isLoading && "animate-spin")} />
          Actualiser
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {containers.map((container) => (
          <div key={container.id} className="card-panel overflow-hidden group hover:border-municipall-blue/30">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
                    container.state === "running" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                  )}>
                    <Box className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight">{container.name}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest truncate max-w-[150px]">
                      {container.image}
                    </p>
                  </div>
                </div>
                <div className={clsx(
                  "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border",
                  container.state === "running" 
                    ? "bg-green-50 text-green-600 border-green-100" 
                    : "bg-red-50 text-red-600 border-red-100"
                )}>
                  {container.state}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wide">
                    <Cpu className="w-3 h-3" />
                    CPU
                  </div>
                  <p className="text-sm font-extrabold text-gray-900">{container.cpu}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wide">
                    <Activity className="w-3 h-3" />
                    RAM
                  </div>
                  <p className="text-sm font-extrabold text-gray-900 truncate">{container.memory}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  {container.uptime}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  Stable
                </div>
              </div>
            </div>
            
            <div className={clsx(
              "h-1 transition-all duration-500",
              container.state === "running" ? "bg-green-500" : "bg-red-500"
            )} style={{ width: container.state === "running" ? "100%" : "30%" }}></div>
          </div>
        ))}
      </div>

      {containers.length === 0 && !isLoading && (
        <div className="py-20 flex flex-col items-center justify-center text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
          <Box className="w-16 h-16 mb-4 opacity-10" />
          <p className="text-sm font-bold">Aucun conteneur détecté sur le VPS.</p>
        </div>
      )}
    </div>
  );
}
