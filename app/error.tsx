"use client";

import { AlertCircle, RefreshCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <AlertCircle className="h-10 w-10 text-red-400" />
      <p className="text-sm font-medium text-slate-600">
        Une erreur est survenue.
      </p>
      <button type="button" onClick={reset} className="btn-secondary">
        <RefreshCcw className="h-4 w-4" />
        Réessayer
      </button>
    </div>
  );
}
