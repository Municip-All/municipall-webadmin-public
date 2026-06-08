import React from "react";
import clsx from "clsx";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "live";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-slate-600 ring-slate-200/80",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200/80",
  warning: "bg-amber-50 text-amber-700 ring-amber-200/80",
  danger: "bg-red-50 text-red-700 ring-red-200/80",
  live: "bg-emerald-50 text-emerald-700 ring-emerald-200/80",
};

export default function Badge({
  children,
  variant = "default",
  dot = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset",
        variants[variant],
        className,
      )}
    >
      {dot && (
        <span
          className={clsx(
            "h-1.5 w-1.5 rounded-full",
            variant === "live"
              ? "animate-pulse bg-emerald-500"
              : "bg-current opacity-70",
          )}
        />
      )}
      {children}
    </span>
  );
}
