"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, AlertCircle } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { assertPlatformAdminKeyConfigured } from "@/lib/adminApi";

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
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const VALID_CODE = "MUNICIPALL2026";

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      assertPlatformAdminKeyConfigured();
    }
  }, [isAuthorized]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.toUpperCase() === VALID_CODE) {
      localStorage.setItem("admin_authorized", "true");
      setIsAuthorized(true);
      setError(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
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

              <button type="submit" className="btn-primary w-full py-3">
                Accéder au panel
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

  return <>{children}</>;
}
