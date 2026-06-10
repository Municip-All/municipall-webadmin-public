"use client";

import React, { useState, useEffect } from "react";
import { Box, Activity, Cpu, RefreshCcw, Clock } from "lucide-react";
import clsx from "clsx";
import { api, DockerContainer } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import PageShell from "@/components/PageShell";
import Badge from "@/components/Badge";
import RequirePermission from "@/components/RequirePermission";
import { PanelPermission } from "@/lib/panelPermissions";

export default function MonitoringPage() {
  const [containers, setContainers] = useState<DockerContainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchContainers = async () => {
    setIsLoading(true);
    try {
      const data = await api.getDockerContainers();
      if (data) {
        setContainers(data);
        setLastUpdated(new Date());
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchContainers().catch(console.error);
    }, 0);

    const interval = setInterval(() => {
      fetchContainers().catch(console.error);
    }, 15000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  return (
    <RequirePermission permission={PanelPermission.MONITORING}>
    <PageShell>
      <PageHeader
        title="État du serveur"
        description={
          <span className="flex flex-wrap items-center gap-2">
            Conteneurs Docker sur le VPS Municip&apos;All
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1.5">
              <RefreshCcw
                className={clsx("h-3.5 w-3.5", isLoading && "animate-spin")}
              />
              {lastUpdated.toLocaleTimeString("fr-FR")}
            </span>
          </span>
        }
        actions={
          <button
            type="button"
            onClick={fetchContainers}
            className="btn-primary"
          >
            <RefreshCcw
              className={clsx("h-4 w-4", isLoading && "animate-spin")}
            />
            Actualiser
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {containers.map((container) => (
          <article key={container.id} className="card-panel overflow-hidden">
            <div className="p-5">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={clsx(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1",
                      container.state === "running"
                        ? "bg-emerald-50 text-emerald-600 ring-emerald-100"
                        : "bg-red-50 text-red-600 ring-red-100",
                    )}
                  >
                    <Box className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-slate-900">
                      {container.name}
                    </h3>
                    <p className="truncate text-[11px] text-slate-400">
                      {container.image}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={container.state === "running" ? "success" : "danger"}
                >
                  {container.state}
                </Badge>
              </div>

              <div className="mb-5 grid grid-cols-2 gap-4">
                <div>
                  <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    <Cpu className="h-3 w-3" />
                    CPU
                  </div>
                  <p className="text-sm font-semibold tabular-nums text-slate-900">
                    {container.cpu}
                  </p>
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    <Activity className="h-3 w-3" />
                    RAM
                  </div>
                  <p className="truncate text-sm font-semibold tabular-nums text-slate-900">
                    {container.memory}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-[11px] font-medium text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  {container.uptime}
                </span>
                {container.state === "running" && (
                  <span className="inline-flex items-center gap-1.5 text-emerald-600">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                    Stable
                  </span>
                )}
              </div>
            </div>
            <div
              className={clsx(
                "h-0.5",
                container.state === "running" ? "bg-emerald-500" : "bg-red-400",
              )}
            />
          </article>
        ))}
      </div>

      {containers.length === 0 && !isLoading && (
        <div className="card-panel flex flex-col items-center justify-center border-dashed py-16 text-center">
          <Box className="mb-3 h-12 w-12 text-slate-200" />
          <p className="text-sm font-medium text-slate-500">
            Aucun conteneur détecté sur le VPS
          </p>
        </div>
      )}
    </PageShell>
    </RequirePermission>
  );
}
