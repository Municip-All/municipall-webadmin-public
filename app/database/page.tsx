"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Database,
  Table2,
  TerminalSquare,
  Play,
  RefreshCcw,
  Search,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import clsx from "clsx";
import { api } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import PageShell from "@/components/PageShell";
import Badge from "@/components/Badge";
import RequirePermission from "@/components/RequirePermission";
import { PanelPermission } from "@/lib/panelPermissions";

interface ColumnInfo {
  name: string;
  type: string;
}

interface TableData {
  columns: ColumnInfo[];
  data: Record<string, unknown>[];
  total: number;
}

export default function DatabasePage() {
  const [tables, setTables] = useState<string[]>([]);
  const [tableFilter, setTableFilter] = useState("");
  const [activeTab, setActiveTab] = useState<"grid" | "sql">("grid");
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM user LIMIT 10;");
  const [sqlResult, setSqlResult] = useState<Record<string, unknown>[] | null>(
    null,
  );
  const [sqlError, setSqlError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchTables = async () => {
      setIsLoading(true);
      const data = await api.getTables();
      if (isMounted && data) {
        setTables(data);
        if (data.length > 0) setSelectedTable(data[0]);
      }
      if (isMounted) setIsLoading(false);
    };
    fetchTables();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (selectedTable && activeTab === "grid") {
      const fetchTableData = async () => {
        setIsLoading(true);
        const data = await api.getTableData(selectedTable);
        if (isMounted && data) setTableData(data as TableData);
        if (isMounted) setIsLoading(false);
      };
      fetchTableData();
    }
    return () => {
      isMounted = false;
    };
  }, [selectedTable, activeTab]);

  const handleExecuteSql = useCallback(async () => {
    if (!sqlQuery.trim()) return;
    setIsExecuting(true);
    setSqlError(null);
    setSqlResult(null);

    const result = await api.executeQuery(sqlQuery);
    if (result && typeof result === "object" && "error" in result) {
      setSqlError(String(result.error));
    } else if (result) {
      setSqlResult(
        Array.isArray(result)
          ? (result as Record<string, unknown>[])
          : [result as Record<string, unknown>],
      );
    }
    setIsExecuting(false);
  }, [sqlQuery]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== "sql") return;
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleExecuteSql();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeTab, handleExecuteSql]);

  const filteredTables = tables.filter((t) =>
    t.toLowerCase().includes(tableFilter.toLowerCase()),
  );

  const refreshTable = () => {
    if (!selectedTable) return;
    setIsLoading(true);
    api.getTableData(selectedTable).then((d) => {
      setTableData(d as TableData);
      setIsLoading(false);
    });
  };

  return (
    <RequirePermission permission={PanelPermission.DATABASE}>
    <PageShell fullHeight className="h-full">
      <PageHeader
        title="Base de données"
        description="Explorateur de tables et éditeur SQL"
        badge={
          <Badge variant="danger" dot>
            Mode avancé
          </Badge>
        }
      />

      <div className="flex min-h-0 flex-1 gap-4">
        {/* Tables sidebar */}
        <aside className="flex w-56 shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-premium lg:w-64">
          <div className="border-b border-slate-100 p-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={tableFilter}
                onChange={(e) => setTableFilter(e.target.value)}
                placeholder="Filtrer les tables…"
                className="input-field py-2 pl-8 text-xs"
              />
            </div>
          </div>
          <div className="flex-1 space-y-0.5 overflow-y-auto p-2">
            {isLoading && tables.length === 0 ? (
              <div className="flex justify-center py-8">
                <RefreshCcw className="h-4 w-4 animate-spin text-slate-400" />
              </div>
            ) : filteredTables.length === 0 ? (
              <p className="px-2 py-6 text-center text-xs text-slate-400">
                Aucune table
              </p>
            ) : (
              filteredTables.map((table) => (
                <button
                  key={table}
                  type="button"
                  onClick={() => {
                    setSelectedTable(table);
                    setActiveTab("grid");
                  }}
                  className={clsx(
                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-all",
                    selectedTable === table
                      ? "bg-municipall-blue font-medium text-white"
                      : "font-medium text-slate-600 hover:bg-slate-50",
                  )}
                >
                  <Table2
                    className={clsx(
                      "h-3.5 w-3.5 shrink-0",
                      selectedTable === table
                        ? "text-white/80"
                        : "text-slate-400",
                    )}
                  />
                  <span className="truncate">{table}</span>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Main workspace */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-premium">
          <div className="flex shrink-0 items-center gap-1 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
            <button
              type="button"
              onClick={() => setActiveTab("grid")}
              className={clsx(
                "tab-pill",
                activeTab === "grid" ? "tab-pill-active" : "tab-pill-inactive",
              )}
            >
              <Database className="h-4 w-4" />
              Visionneuse
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("sql")}
              className={clsx(
                "tab-pill",
                activeTab === "sql" ? "tab-pill-active" : "tab-pill-inactive",
              )}
            >
              <TerminalSquare className="h-4 w-4" />
              Éditeur SQL
            </button>
          </div>

          <div className="relative min-h-0 flex-1">
            {activeTab === "grid" && (
              <div className="absolute inset-0 flex flex-col">
                <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Table2 className="h-4 w-4 shrink-0 text-municipall-blue" />
                    <h3 className="truncate text-sm font-semibold text-slate-900">
                      {selectedTable ?? "—"}
                    </h3>
                    <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                      {tableData?.total ?? 0} lignes
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={refreshTable}
                    className="btn-ghost !p-2"
                    aria-label="Actualiser la table"
                  >
                    <RefreshCcw
                      className={clsx("h-4 w-4", isLoading && "animate-spin")}
                    />
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-auto bg-slate-50/40">
                  {isLoading ? (
                    <div className="flex h-full items-center justify-center">
                      <RefreshCcw className="h-6 w-6 animate-spin text-municipall-blue/30" />
                    </div>
                  ) : !tableData || tableData.data.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">
                      Table vide
                    </div>
                  ) : (
                    <table className="data-table whitespace-nowrap">
                      <thead className="sticky top-0 z-10">
                        <tr>
                          {tableData.columns.map((col, i) => (
                            <th key={i}>
                              {col.name}
                              <span className="mt-0.5 block text-[10px] font-normal uppercase text-slate-400">
                                {col.type}
                              </span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.data.map((row, i) => (
                          <tr key={i}>
                            {tableData.columns.map((col, j) => (
                              <td key={j} className="max-w-[220px] truncate">
                                {row[col.name] !== null ? (
                                  String(row[col.name])
                                ) : (
                                  <span className="italic text-slate-300">
                                    null
                                  </span>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {activeTab === "sql" && (
              <div className="absolute inset-0 flex flex-col bg-slate-50/30">
                <div className="flex shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-4 py-2.5">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <TerminalSquare className="h-4 w-4 text-municipall-blue" />
                    Requête SQL
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="hidden text-[11px] text-slate-400 sm:inline">
                      ⌘ + Entrée
                    </span>
                    <button
                      type="button"
                      onClick={handleExecuteSql}
                      disabled={isExecuting}
                      className="btn-primary !py-2"
                    >
                      {isExecuting ? (
                        <RefreshCcw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4 fill-current" />
                      )}
                      Exécuter
                    </button>
                  </div>
                </div>

                <div className="min-h-[140px] shrink-0 border-b border-slate-200/80 bg-white">
                  <textarea
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    spellCheck={false}
                    className="sql-editor h-full min-h-[140px] w-full resize-none border-0 bg-transparent p-4 focus:outline-none focus:ring-0"
                    aria-label="Éditeur SQL"
                  />
                </div>

                <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
                  <div className="section-title shrink-0 border-b border-slate-100 px-4 py-2">
                    Résultats
                  </div>
                  <div className="min-h-0 flex-1 overflow-auto p-4">
                    {sqlError ? (
                      <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                        <pre className="whitespace-pre-wrap font-mono text-xs">
                          {sqlError}
                        </pre>
                      </div>
                    ) : sqlResult ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                          <CheckCircle2 className="h-4 w-4" />
                          {sqlResult.length} ligne
                          {sqlResult.length > 1 ? "s" : ""}
                        </div>
                        {sqlResult.length > 0 && (
                          <div className="overflow-x-auto rounded-xl ring-1 ring-slate-200">
                            <table className="data-table font-mono text-xs whitespace-nowrap">
                              <thead>
                                <tr>
                                  {Object.keys(sqlResult[0] || {}).map(
                                    (key, i) => (
                                      <th key={i}>{key}</th>
                                    ),
                                  )}
                                </tr>
                              </thead>
                              <tbody>
                                {sqlResult.map((row, i) => (
                                  <tr key={i}>
                                    {Object.values(row).map(
                                      (val: unknown, j) => (
                                        <td
                                          key={j}
                                          className="max-w-[280px] truncate"
                                        >
                                          {val !== null ? (
                                            String(val)
                                          ) : (
                                            <span className="italic text-slate-300">
                                              null
                                            </span>
                                          )}
                                        </td>
                                      ),
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="flex h-full items-center justify-center text-sm text-slate-400">
                        Exécutez une requête pour afficher les résultats
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
    </RequirePermission>
  );
}
