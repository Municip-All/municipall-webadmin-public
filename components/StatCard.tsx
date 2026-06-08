import React from "react";
import { LucideIcon } from "lucide-react";
import clsx from "clsx";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
}

export default function StatCard({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="card-panel group p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-municipall-blue/[0.06] ring-1 ring-municipall-blue/10 transition-colors group-hover:bg-municipall-blue/[0.09]">
          <Icon className="h-5 w-5 text-municipall-blue" strokeWidth={2} />
        </div>
        {change && (
          <span
            className={clsx(
              "rounded-md px-2 py-0.5 text-[11px] font-semibold",
              isPositive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700",
            )}
          >
            {change}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="section-title mb-1">{title}</p>
        <p className="text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">
          {value}
        </p>
      </div>
    </div>
  );
}
