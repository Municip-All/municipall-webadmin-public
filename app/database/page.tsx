"use client";

import React, { useState, useEffect } from "react";
import { 
  Database, 
  Table2, 
  TerminalSquare, 
  Play, 
  RefreshCcw,
  Search,
  ChevronRight,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import clsx from "clsx";
import { api } from "@/lib/api";

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
  const [activeTab, setActiveTab] = useState<"grid" | "sql">("grid");
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // SQL Editor State
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM user LIMIT 10;");
  const [sqlResult, setSqlResult] = useState<Record<string, unknown>[] | null>(null);
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
    return () => { isMounted = false; };
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
    return () => { isMounted = false; };
  }, [selectedTable, activeTab]);

  const handleExecuteSql = async () => {
    if (!sqlQuery.trim()) return;
    setIsExecuting(true);
    setSqlError(null);
    setSqlResult(null);

    const result = await api.executeQuery(sqlQuery);
    if (result && typeof result === 'object' && 'error' in result) {
      setSqlError(String(result.error));
    } else if (result) {
      setSqlResult(Array.isArray(result) ? (result as Record<string, unknown>[]) : [result as Record<string, unknown>]);
    }
    setIsExecuting(false);
  };

  return (
    <div className="p-8 h-screen flex flex-col">
      <header className="mb-6 flex items-end justify-between shrink-0">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Base de Données</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <p>Explorateur SQL (Mode Avancé)</p>
            <span className="text-gray-300">•</span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded-full border border-red-100 uppercase tracking-wider">
              <AlertCircle className="w-3 h-3" />
              God Mode Actif
            </span>
          </div>
        </div>
      </header>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Sidebar - Tables List */}
        <div className="w-64 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Chercher une table..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-municipall-blue focus:border-transparent outline-none"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {isLoading && tables.length === 0 ? (
              <div className="flex justify-center p-4"><RefreshCcw className="w-4 h-4 animate-spin text-gray-400" /></div>
            ) : (
              tables.map(table => (
                <button
                  key={table}
                  onClick={() => { setSelectedTable(table); setActiveTab("grid"); }}
                  className={clsx(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all text-left",
                    selectedTable === table
                      ? "bg-municipall-blue text-white font-bold shadow-md shadow-municipall-blue/20"
                      : "text-gray-600 hover:bg-gray-50 font-medium"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Table2 className={clsx("w-4 h-4 shrink-0", selectedTable === table ? "text-white/80" : "text-gray-400")} />
                    <span className="truncate">{table}</span>
                  </div>
                  {selectedTable === table && <ChevronRight className="w-4 h-4 opacity-70" />}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden min-w-0">
          {/* Tabs */}
          <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
            <button
              onClick={() => setActiveTab("grid")}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                activeTab === "grid" ? "bg-white text-municipall-blue shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-900"
              )}
            >
              <Database className="w-4 h-4" />
              Visionneuse (Table)
            </button>
            <button
              onClick={() => setActiveTab("sql")}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                activeTab === "sql" ? "bg-white text-municipall-blue shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-900"
              )}
            >
              <TerminalSquare className="w-4 h-4" />
              Éditeur SQL
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden relative">
            {activeTab === "grid" && (
              <div className="absolute inset-0 flex flex-col">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center shrink-0">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Table2 className="w-5 h-5 text-municipall-blue" />
                    {selectedTable}
                    <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                      {tableData?.total || 0} lignes
                    </span>
                  </h3>
                  <button onClick={() => { if(selectedTable) { setIsLoading(true); api.getTableData(selectedTable).then(d => { setTableData(d); setIsLoading(false); }) } }} className="p-1.5 text-gray-400 hover:text-municipall-blue transition-colors">
                    <RefreshCcw className={clsx("w-4 h-4", isLoading && "animate-spin")} />
                  </button>
                </div>
                <div className="flex-1 overflow-auto bg-gray-50/30">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-full"><RefreshCcw className="w-8 h-8 animate-spin text-municipall-blue/30" /></div>
                  ) : !tableData || tableData.data.length === 0 ? (
                    <div className="flex justify-center items-center h-full text-gray-400 font-medium">Table vide</div>
                  ) : (
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-gray-100/80 sticky top-0 z-10 shadow-sm">
                        <tr>
                          {tableData.columns.map((col, i) => (
                            <th key={i} className="px-4 py-3 font-bold text-gray-700 border-b border-gray-200">
                              {col.name}
                              <span className="block text-[9px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">{col.type}</span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {tableData.data.map((row, i) => (
                          <tr key={i} className="hover:bg-blue-50/50 transition-colors">
                            {tableData.columns.map((col, j) => (
                              <td key={j} className="px-4 py-3 text-gray-600 font-medium max-w-[200px] truncate">
                                {row[col.name] !== null ? String(row[col.name]) : <span className="text-gray-300 italic">null</span>}
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
              <div className="absolute inset-0 flex flex-col bg-gray-900 text-gray-100">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center shrink-0 bg-gray-950">
                  <div className="flex items-center gap-2">
                    <TerminalSquare className="w-5 h-5 text-green-400" />
                    <span className="font-mono text-sm font-bold text-gray-200">Requête SQL</span>
                  </div>
                  <button 
                    onClick={handleExecuteSql}
                    disabled={isExecuting}
                    className="flex items-center gap-2 px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isExecuting ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                    Exécuter
                  </button>
                </div>
                <div className="flex-1 border-b border-gray-800 relative">
                  <textarea 
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    spellCheck="false"
                    className="w-full h-full bg-transparent p-4 font-mono text-sm text-blue-300 focus:outline-none resize-none leading-relaxed"
                  />
                  <div className="absolute bottom-4 right-4 text-xs font-mono text-gray-500 pointer-events-none">
                    Cmd+Enter pour exécuter
                  </div>
                </div>
                
                {/* SQL Results Area */}
                <div className="h-1/2 bg-gray-950 overflow-hidden flex flex-col">
                  <div className="px-4 py-2 bg-gray-900 border-b border-gray-800 text-xs font-bold text-gray-400 uppercase tracking-widest shrink-0">
                    Résultats
                  </div>
                  <div className="flex-1 overflow-auto p-4">
                    {sqlError ? (
                      <div className="flex items-start gap-3 text-red-400 bg-red-400/10 p-4 rounded-xl border border-red-400/20 font-mono text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <span className="whitespace-pre-wrap">{sqlError}</span>
                      </div>
                    ) : sqlResult ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-green-400 text-sm font-mono font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          Requête exécutée avec succès ({sqlResult.length} lignes)
                        </div>
                        {sqlResult.length > 0 && (
                          <div className="overflow-x-auto rounded-xl border border-gray-800">
                            <table className="w-full text-left text-sm whitespace-nowrap font-mono">
                              <thead className="bg-gray-900">
                                <tr>
                                  {Object.keys(sqlResult[0] || {}).map((key, i) => (
                                    <th key={i} className="px-4 py-3 font-bold text-gray-300 border-b border-gray-800">{key}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-800">
                                {sqlResult.map((row, i) => (
                                  <tr key={i} className="hover:bg-gray-800/50">
                                    {Object.values(row).map((val: unknown, j) => (
                                      <td key={j} className="px-4 py-3 text-gray-400 max-w-[300px] truncate">
                                        {val !== null ? String(val) : <span className="text-gray-600 italic">null</span>}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-600 font-mono text-sm">
                        Aucun résultat à afficher.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
