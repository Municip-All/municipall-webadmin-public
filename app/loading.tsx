import { RefreshCcw } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <RefreshCcw className="h-8 w-8 animate-spin text-slate-300" />
      <p className="text-sm font-medium text-slate-400">Chargement…</p>
    </div>
  );
}
