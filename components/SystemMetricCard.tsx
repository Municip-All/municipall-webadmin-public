import React from "react";
import { LucideIcon } from "lucide-react";
import clsx from "clsx";

interface SystemMetricCardProps {
  label: string;
  value: React.ReactNode;
  subValue?: string;
  icon: LucideIcon;
  progress?: number;
  accent?: "brand" | "emerald" | "sky" | "amber";
}

const accents = {
  brand: { icon: "text-municipall-blue", bar: "bg-municipall-blue" },
  emerald: { icon: "text-emerald-600", bar: "bg-emerald-500" },
  sky: { icon: "text-sky-600", bar: "bg-sky-500" },
  amber: { icon: "text-amber-600", bar: "bg-amber-500" },
};

export default function SystemMetricCard({
  label,
  value,
  subValue,
  icon: Icon,
  progress,
  accent = "brand",
}: SystemMetricCardProps) {
  const a = accents[accent];

  return (
    <div className="card-panel p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 ring-1 ring-slate-100">
          <Icon className={clsx("h-4 w-4", a.icon)} strokeWidth={2} />
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </span>
      </div>
      <div className="text-xl font-semibold text-slate-900">{value}</div>
      {subValue && (
        <p className="mt-0.5 text-xs font-medium text-slate-500">{subValue}</p>
      )}
      {progress !== undefined && (
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className={clsx("h-full rounded-full transition-all duration-500", a.bar)}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
}
