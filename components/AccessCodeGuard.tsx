"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";

export default function AccessCodeGuard({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("admin_authorized") === "true";
    }
    return false;
  });
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Hardcoded for now as requested, could be moved to process.env.NEXT_PUBLIC_ADMIN_CODE
  const VALID_CODE = "MUNICIPALL2026";

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

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
      <div className="min-h-screen w-full flex items-center justify-center bg-[#fcfcfd] relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-indigo-50/50 to-transparent pointer-events-none"></div>
        
        <div className="relative z-10 w-full max-w-md p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-municipall-blue rounded-2xl flex items-center justify-center shadow-lg shadow-municipall-blue/20 mb-6">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Municip&apos;All Admin</h1>
            <p className="text-gray-500 font-medium mt-1">Accès réservé au personnel interne</p>
          </div>

          <div className="bg-white rounded-2xl shadow-premium border border-gray-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 text-center">
                  Entrez votre code d&apos;accès
                </label>
                <input
                  type="password"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className={`w-full bg-gray-50 border ${error ? 'border-red-500 bg-red-50' : 'border-gray-200'} text-gray-900 text-center text-xl tracking-widest font-bold rounded-xl px-4 py-4 focus:ring-2 focus:ring-municipall-blue focus:border-transparent outline-none transition-all`}
                  placeholder="••••••••"
                  autoFocus
                />
              </div>

              {error && (
                <div className="flex items-center justify-center gap-2 text-red-600 text-sm font-bold animate-shake">
                  <AlertCircle className="w-4 h-4" />
                  Code invalide
                </div>
              )}

              <button
                type="submit"
                className="w-full btn-primary py-4 text-base rounded-xl justify-center"
              >
                Déverrouiller
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
          
          <p className="text-center text-xs text-gray-400 mt-8">
            En accédant à cet espace, vous acceptez la charte de confidentialité Municip&apos;All.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
