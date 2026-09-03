"use client";

import React, { useEffect, useState } from "react";
import { Database, Play, RefreshCcw, Sprout } from "lucide-react";
import clsx from "clsx";
import { api } from "@/lib/api";
import { useConfirmDialog } from "@/context/ConfirmDialogContext";
import { useToast } from "@/context/ToastContext";
import {
  getStoredAdminEnvironment,
  type AdminEnvironment,
} from "@/lib/environment";

export default function DemoSeedPanel() {
  const { confirm } = useConfirmDialog();
  const { toast } = useToast();
  const [env] = useState<AdminEnvironment>(() =>
    typeof window !== "undefined"
      ? getStoredAdminEnvironment()
      : "DEV",
  );
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [resetBeforeSeed, setResetBeforeSeed] = useState(true);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);

  useEffect(() => {
    if (env !== "DEV") return;
    api.getDemoSeedStatus().then((status) => {
      if (status) setEnabled(status.enabled);
    });
  }, [env]);

  if (env !== "DEV") {
    return null;
  }

  const handleRunSeed = async () => {
    const ok = await confirm({
      title: resetBeforeSeed
        ? "Réinitialiser et régénérer la démo ?"
        : "Ajouter un jeu de démo ?",
      description: "Jeu de données démo v2 — Le Kremlin-Bicêtre",
      message: resetBeforeSeed
        ? "Supprime les comptes @demo.municipall.dev et toutes les données liées (signalements, questions, suggestions, événements, travaux), puis recrée un jeu frais : incidents voirie/éclairage, questions mairie, suggestions quartier."
        : "Ajoute un jeu de démo sans supprimer les données existantes (--no-reset).",
      confirmLabel: resetBeforeSeed ? "Supprimer et régénérer" : "Ajouter le seed",
      variant: resetBeforeSeed ? "danger" : "default",
    });
    if (!ok) return;

    setRunning(true);
    setOutput(null);
    setDurationMs(null);

    try {
      const result = await api.runDemoSeed({ reset: resetBeforeSeed });
      setOutput(result.output);
      setDurationMs(result.durationMs);
      toast("success", `Seed démo v2 terminé en ${(result.durationMs / 1000).toFixed(1)}s`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Échec du seed de démo.";
      toast("error", message);
      if (error instanceof Error && error.message.includes("output")) {
        setOutput(error.message);
      }
    } finally {
      setRunning(false);
    }
  };

  return (
    <section className="mb-4 shrink-0 rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
            <Sprout className="h-5 w-5 text-emerald-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Seed de démo v2 (DEV)
            </h3>
            <p className="mt-1 max-w-xl text-xs text-slate-600">
              Régénère Le Kremlin-Bicêtre avec un jeu mis à jour : signalements
              (voirie, éclairage, sécurité…), questions &amp; suggestions, événements
              et travaux. Comptes{" "}
              <code className="rounded bg-white/80 px-1">@demo.municipall.dev</code>{" "}
              / mot de passe{" "}
              <code className="rounded bg-white/80 px-1">Demo2026!</code>.
            </p>
            <ul className="mt-2 list-inside list-disc text-[11px] text-slate-500">
              <li>Cocher « Réinitialiser » pour remplacer l’ancienne démo</li>
              <li>Puis rouvrir le backoffice mairie pour voir la liste Signalements</li>
            </ul>
            {enabled === false && (
              <p className="mt-2 text-xs font-medium text-amber-700">
                Seed désactivé côté API sur cet environnement.
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700">
            <input
              type="checkbox"
              checked={resetBeforeSeed}
              onChange={(e) => setResetBeforeSeed(e.target.checked)}
              disabled={running}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            Réinitialiser avant seed
          </label>
          <button
            type="button"
            onClick={handleRunSeed}
            disabled={running || enabled === false}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {running ? (
              <RefreshCcw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {running ? "Seed en cours…" : "Régénérer la démo"}
          </button>
        </div>
      </div>

      {output && (
        <div className="mt-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Database className="h-3.5 w-3.5" />
            Journal
            {durationMs != null && (
              <span className={clsx("tabular-nums")}>
                · {(durationMs / 1000).toFixed(1)}s
              </span>
            )}
          </div>
          <pre className="max-h-48 overflow-auto rounded-xl border border-emerald-100 bg-white p-3 text-[11px] leading-relaxed text-slate-700">
            {output}
          </pre>
        </div>
      )}
    </section>
  );
}
