"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
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
import UserActionsMenu from "@/components/users/UserActionsMenu";
import UserEditModal, {
  type UserEditForm,
} from "@/components/users/UserEditModal";
import { useToast } from "@/context/ToastContext";
import { useConfirmDialog } from "@/context/ConfirmDialogContext";
import { roleBadgeClass, roleLabel } from "@/lib/userRoles";

export default function UsersPage() {
  const { toast } = useToast();
  const { confirm } = useConfirmDialog();
  const [users, setUsers] = useState<User[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCity, setFilterCity] = useState("Toutes");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      const [userData, cityData] = await Promise.all([
        api.getUsers(),
        api.getCities(),
      ]);
      if (cancelled) return;
      if (userData) setUsers(userData);
      if (cityData) setCities(cityData);
    };

    void loadData().catch(console.error);

    return () => {
      cancelled = true;
    };
  }, []);

  const getCityName = (cityId: string | undefined) => {
    if (!cityId) return "—";
    const city = cities.find((c) => c.id === cityId);
    return city ? city.name : cityId;
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

  const handleSaveUser = async (form: UserEditForm) => {
    if (!editingUser) return;

    setSaving(true);
    const payload: Parameters<typeof api.updateUser>[1] = {
      name: form.name.trim(),
      surname: form.surname.trim(),
      role: form.role,
      cityId: form.cityId || "",
    };
    if (form.password.trim()) {
      payload.password = form.password.trim();
    }

    const updated = await api.updateUser(editingUser.id, payload);
    setSaving(false);

    if (!updated) {
      toast("error", "Impossible de mettre à jour l'utilisateur.");
      return;
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)),
    );
    setEditingUser(null);
    toast("success", "Compte mis à jour.");
  };

  const handleDeleteUser = async (user: User) => {
    const ok = await confirm({
      title: "Supprimer ce compte ?",
      message: (
        <>
          <span className="font-semibold text-slate-900">
            {user.name} {user.surname}
          </span>{" "}
          ({user.email}) sera définitivement supprimé.
        </>
      ),
      description:
        "Cette action est irréversible. Les signalements liés ne seront pas supprimés automatiquement.",
      confirmLabel: "Supprimer",
      variant: "danger",
    });

    if (!ok) return;

    const success = await api.deleteUser(user.id);
    if (!success) {
      toast("error", "Impossible de supprimer l'utilisateur.");
      return;
    }

    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    toast("success", "Compte supprimé.");
  };

  return (
    <PageShell>
      <PageHeader
        title="Utilisateurs"
        description="Consultez et gérez les accès de tous les utilisateurs du réseau."
        actions={
          <button type="button" className="btn-secondary">
            Exporter
          </button>
        }
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
            {filteredUsers.length} résultat
            {filteredUsers.length !== 1 ? "s" : ""}
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
                        "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium",
                        roleBadgeClass(user.role),
                      )}
                    >
                      <UserCircle className="h-3 w-3" />
                      {roleLabel(user.role)}
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
                        : "—"}
                    </span>
                  </td>
                  <td className="text-right">
                    <UserActionsMenu
                      user={user}
                      onEdit={setEditingUser}
                      onDelete={handleDeleteUser}
                      onCopy={(message) => toast("info", message)}
                    />
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

      {editingUser && (
        <UserEditModal
          key={editingUser.id}
          user={editingUser}
          cities={cities}
          cityName={getCityName(editingUser.cityId)}
          saving={saving}
          onClose={() => setEditingUser(null)}
          onSave={handleSaveUser}
        />
      )}
    </PageShell>
  );
}
