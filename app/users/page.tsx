"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  MoreVertical, 
  ArrowUpDown, 
  MapPin, 
  UserCircle,
  Calendar,
  CheckCircle2
} from "lucide-react";
import clsx from "clsx";
import { api, User } from "@/lib/api";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCity, setFilterCity] = useState("Toutes");

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await api.getUsers();
      if (data) setUsers(data);
    };
    fetchUsers().catch(console.error);
  }, []);

  const filteredUsers = users.filter(user => {
    const name = `${user.name || ""} ${user.surname || ""}`.toLowerCase();
    const email = (user.email || "").toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase()) || 
                          email.includes(searchTerm.toLowerCase());
    const matchesCity = filterCity === "Toutes" || user.city === filterCity;
    return matchesSearch && matchesCity;
  });

  return (
    <div className="p-8">
      <header className="mb-10 flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Gestion des Utilisateurs</h2>
          <p className="text-sm text-gray-500 font-medium">Consultez et modifiez les accès de tous les utilisateurs du réseau.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="btn-primary">
            Exporter la liste
          </button>
        </div>
      </header>

      <div className="card-panel overflow-hidden">
        {/* Filters Bar */}
        <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Nom, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-municipall-blue/10 outline-none w-64 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase">Ville:</span>
              <select 
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-municipall-blue/10"
              >
                <option>Toutes</option>
                <option>Bouffémont</option>
                <option>Domont</option>
                <option>Ézanville</option>
                <option>Cergy</option>
              </select>
            </div>
          </div>
          
          <div className="text-xs font-bold text-gray-400">
            {filteredUsers.length} utilisateur(s) trouvé(s)
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Utilisateur</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-gray-600 transition-colors">
                    Ville <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Rôle</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Inscription</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-municipall-blue font-bold text-sm">
                        {user.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{user.name} {user.surname}</p>
                        <p className="text-xs text-gray-500 font-medium">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {user.city || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold capitalize",
                      user.role === "agent" ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-600"
                    )}>
                      <UserCircle className="w-3 h-3" />
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-xs font-bold text-green-600">Actif</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-white rounded-lg transition-all">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <Search className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm font-bold">Aucun utilisateur ne correspond à votre recherche.</p>
          </div>
        )}
      </div>
    </div>
  );
}
