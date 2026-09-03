"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  ArrowUpDown,
  MapPin,
  UserCircle,
  Calendar,
  CheckCircle2,
  Users,
  UserCircle2,
  Building2,
  UserPlus,
  MapPinOff,
} from "lucide-react";
import clsx from "clsx";
import { api, User, City } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import PageShell from "@/components/PageShell";
import StatCard from "@/components/StatCard";
import UserActionsMenu from "@/components/users/UserActionsMenu";
import UserEditModal, {
  type UserEditForm,
} from "@/components/users/UserEditModal";
import RequirePermission from "@/components/RequirePermission";
import { useToast } from "@/context/ToastContext";
import { useConfirmDialog } from "@/context/ConfirmDialogContext";
import { usePanelRole } from "@/context/PanelRoleContext";
import { PanelPermission } from "@/lib/panelPermissions";
import { roleBadgeClass, roleLabel } from "@/lib/userRoles";
import { computeUserKpis } from "@/lib/userStats";

export default function UsersPage() {
  const { toast } = useToast();
  const { confirm } = useConfirmDialog();
  const { can } = usePanelRole();
  const canEdit = can(PanelPermission.USERS_EDIT);
  const canDelete = can(PanelPermission.USERS_DELETE);

  const [users, setUsers] = useState<User[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCity, setFilterCity] = useState("Toutes");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      try {
        const [userData, cityData] = await Promise.all([
          api.getUsers(),
          api.getCities(),
        ]);
        if (cancelled) return;
        if (userData) setUsers(userData);
        if (cityData) setCities(cityData);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadData().catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const kpis = useMemo(() => computeUserKpis(users), [users]);

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
    if (!editingUser || !canEdit) return;

    setSaving(true);
    try {
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

      if (!updated) {
        toast("error", "Impossible de mettre à jour l'utilisateur.");
        return;
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)),
      );
      setEditingUser(null);
      toast("success", "Compte mis à jour.");
    } catch {
      toast("error", "Erreur lors de la mise à jour.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!canDelete) return;

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

    const result = await api.deleteUser(user.id);
    if (!result.ok) {
      toast("error", result.message || "Impossible de supprimer l'utilisateur.");
      return;
    }

    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    toast("success", "Compte supprimé.");
  };

  return (
    <RequirePermission permission={PanelPermission.USERS_VIEW}>
      <PageShell fullHeight className="h-full">
        <PageHeader
          title="Utilisateurs"
          description="Consultez et gérez les accès de tous les utilisateurs du réseau."
          actions={
            <button type="button" className="btn-secondary cursor-not-allowed opacity-50" disabled>
              Exporter
            </button>
          }
        />

        <section className="mb-6 shrink-0">
          <h2 className="section-title mb-3">Indicateurs</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            <StatCard
              title="Total comptes"
              value={loading ? "—" : kpis.total.toLocaleString("fr-FR")}
              change="Réseau"
              icon={Users}
            />
            <StatCard
              title="Citoyens"
              value={loading ? "—" : kpis.citizens.toLocaleString("fr-FR")}
              change={`${kpis.total ? Math.round((kpis.citizens / kpis.total) * 100) : 0}%`}
              icon={UserCircle2}
            />
            <StatCard
              title="Personnel mairie"
              value={loading ? "—" : kpis.staff.toLocaleString("fr-FR")}
              change="Agents + élus"
              icon={Building2}
            />
            <StatCard
              title="Maires"
              value={loading ? "—" : kpis.mayors.toLocaleString("fr-FR")}
              change="Comptes"
              icon={UserCircle}
            />
            <StatCard
              title="Sans commune"
              value={loading ? "—" : kpis.withoutCity.toLocaleString("fr-FR")}
              change={kpis.withoutCity > 0 ? "À vérifier" : "OK"}
              isPositive={kpis.withoutCity === 0}
              icon={MapPinOff}
            />
            <StatCard
              title="Nouveaux ce mois"
              value={loading ? "—" : kpis.newThisMonth.toLocaleString("fr-FR")}
              change="Inscriptions"
              icon={UserPlus}
            />
          </div>
        </section>

        <div className="card-panel flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0 flex flex-col gap-4 border-b border-slate-100 bg-slate-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">
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

          <div className="min-h-0 flex-1 overflow-auto bg-slate-50/30">
            <table className="data-table whitespace-nowrap">
              <thead className="sticky top-0 z-10 bg-white shadow-[0_1px_0_0_rgb(226_232_240)]">
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
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-sm text-slate-400">
                      Chargement des utilisateurs…
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-sm text-slate-400">
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
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
                          canEdit={canEdit}
                          canDelete={canDelete}
                          onEdit={setEditingUser}
                          onDelete={handleDeleteUser}
                          onCopy={(message) => toast("info", message)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {editingUser && canEdit && (
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
    </RequirePermission>
  );
}
