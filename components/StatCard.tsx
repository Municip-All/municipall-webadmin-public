import React from "react";
import { LucideIcon } from "lucide-react";
import clsx from "clsx";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
}

export default function StatCard({ 
  title, 
  value, 
  change, 
  isPositive, 
  icon: Icon,
  iconColor,
  iconBg
}: StatCardProps) {
  return (
    <div className="card-panel p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
          <Icon className={clsx("w-6 h-6", iconColor)} />
        </div>
        {change && (
          <div className={clsx(
            "text-xs font-bold px-2 py-1 rounded-lg",
            isPositive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
          )}>
            {isPositive ? "+" : ""}{change}
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-2xl font-extrabold text-gray-900">{value}</h3>
      </div>
    </div>
  );
}
