"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  MoreVertical,
  ArrowUpDown,
  MapPin,
  UserCircle,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import clsx from "clsx";
import { api, User, City } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import PageShell from "@/components/PageShell";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCity, setFilterCity] = useState("Toutes");

  useEffect(() => {
    const fetchData = async () => {
      const [userData, cityData] = await Promise.all([
        api.getUsers(),
        api.getCities(),
      ]);
      if (userData) setUsers(userData);
      if (cityData) setCities(cityData);
    };
    fetchData().catch(console.error);
  }, []);

  const getCityName = (cityId: string | undefined) => {
    if (!cityId) return "N/A";
    const city = cities.find((c) => c.id === cityId);
    return city ? city.name : "N/A";
  };

  const filteredUsers = users.filter((user) => {
    const name = `${user.name || ""} ${user.surname || ""}`.toLowerCase();
    const email = (user.email || "").toLowerCase();
    const matchesSearch =
      name.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase());
    const matchesCity = filterCity === "Toutes" || user.cityId === filterCity;
    return matchesSearch && matchesCity;
  });

  return (
    <PageShell>
      <PageHeader
        title="Utilisateurs"
        description="Consultez et gérez les accès de tous les utilisateurs du réseau."
        actions={<button type="button" className="btn-secondary">Exporter</button>}
      />

      <div className="card-panel overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Nom, email…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field w-56 pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="section-title">Ville</span>
              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="input-field w-auto py-2"
              >
                <option value="Toutes">Toutes</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-xs font-medium text-slate-500">
            {filteredUsers.length} résultat{filteredUsers.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>
                  <span className="inline-flex items-center gap-1">
                    Ville <ArrowUpDown className="h-3 w-3 opacity-50" />
                  </span>
                </th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Inscription</th>
                <th className="w-12" />
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-municipall-blue/[0.08] text-sm font-semibold text-municipall-blue">
                        {user.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {user.name} {user.surname}
                        </p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {getCityName(user.cityId)}
                    </span>
                  </td>
                  <td>
                    <span
                      className={clsx(
                        "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium capitalize",
                        user.role === "agent"
                          ? "bg-municipall-blue/10 text-municipall-blue"
                          : "bg-slate-100 text-slate-600"
                      )}
                    >
                      <UserCircle className="h-3 w-3" />
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                      Actif
                    </span>
                  </td>
                  <td>
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar className="h-3.5 w-3.5" />
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString("fr-FR")
                        : "N/A"}
                    </span>
                  </td>
                  <td className="text-right">
                    <button type="button" className="btn-ghost !p-2">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Search className="mb-3 h-10 w-10 opacity-20" />
            <p className="text-sm font-medium">Aucun utilisateur trouvé</p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
