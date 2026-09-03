"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  AlertCircle,
  Crown,
  Headphones,
  TrendingUp,
  Wrench,
} from "lucide-react";
import clsx from "clsx";
import BrandLogo from "@/components/BrandLogo";
import { assertPlatformAdminKeyConfigured } from "@/lib/adminApi";
import {
  getStoredPanelRole,
  setStoredPanelRole,
  PANEL_ROLES,
  type PanelRole,
} from "@/lib/platformRoles";

const ROLE_ICONS: Record<PanelRole, React.ElementType> = {
  chief: Crown,
  tech: Wrench,
  sales: TrendingUp,
  support: Headphones,
};

export default function AccessCodeGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthorized, setIsAuthorized] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("admin_authorized") === "true";
    }
    return false;
  });
  const [hasRole, setHasRole] = useState(() => {
    if (typeof window !== "undefined") {
      return getStoredPanelRole() !== null;
    }
    return false;
  });
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isAuthorized) return;

    let cancelled = false;
    void (async () => {
      // localStorage seul ne suffit pas : le proxy exige le cookie admin_session.
      const ok = await assertPlatformAdminKeyConfigured();
      if (cancelled) return;
      if (!ok) {
        localStorage.removeItem("admin_authorized");
        setIsAuthorized(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthorized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
        credentials: "same-origin",
        signal: AbortSignal.timeout(15_000),
      });
      const data = await res.json();
      if (data.valid) {
        localStorage.setItem("admin_authorized", "true");
        setIsAuthorized(true);
        setError(false);
        setNetworkError(false);
      } else {
        setError(true);
        setNetworkError(false);
        setTimeout(() => setError(false), 2000);
      }
    } catch {
      setNetworkError(true);
      setError(false);
      setTimeout(() => setNetworkError(false), 3000);
    }
  };

  const handleRoleSelect = (role: PanelRole) => {
    setStoredPanelRole(role);
    setHasRole(true);
  };

  if (isLoading) return null;

  if (!isAuthorized) {
    return (
      <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[var(--background)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(11, 0, 128, 0.08), transparent), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(79, 70, 229, 0.06), transparent)",
          }}
        />

        <div className="relative z-10 w-full max-w-md px-6">
          <div className="mb-8 flex flex-col items-center text-center">
            <BrandLogo size="lg" className="mb-5 justify-center" />
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Municip&apos;All Panel
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Accès réservé au personnel interne
            </p>
          </div>

          <div className="card-panel p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="access-code"
                  className="mb-2 block text-center text-sm font-medium text-slate-700"
                >
                  Code d&apos;accès
                </label>
                <input
                  id="access-code"
                  type="password"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className={`input-field text-center text-lg font-semibold tracking-[0.2em] ${
                    error ? "border-red-300 bg-red-50/50 ring-red-100" : ""
                  }`}
                  placeholder="••••••••"
                  autoFocus
                />
              </div>

              {error && (
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  Code invalide
                </div>
              )}

              {networkError && (
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  Erreur réseau. Réessayez.
                </div>
              )}

              <button type="submit" className="btn-primary w-full py-3">
                Continuer
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            En accédant à cet espace, vous acceptez la charte de confidentialité
            Municip&apos;All.
          </p>
        </div>
      </div>
    );
  }

  if (!hasRole) {
    return (
      <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[var(--background)] p-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(11, 0, 128, 0.08), transparent)",
          }}
        />

        <div className="relative z-10 w-full max-w-2xl">
          <div className="mb-8 text-center">
            <BrandLogo size="lg" className="mb-5 justify-center" />
            <h1 className="text-2xl font-semibold text-slate-900">
              Choisissez votre profil
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Chaque équipe dispose d&apos;un accès adapté à ses missions
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {PANEL_ROLES.map((role) => {
              const Icon = ROLE_ICONS[role.id];
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleRoleSelect(role.id)}
                  className={clsx(
                    "card-panel group flex flex-col items-start gap-3 p-5 text-left transition-all",
                    "hover:border-municipall-blue/30 hover:shadow-md",
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-municipall-blue/[0.08] text-municipall-blue transition-colors group-hover:bg-municipall-blue/[0.12]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{role.label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      {role.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
