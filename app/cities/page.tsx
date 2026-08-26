"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Building2,
  Plus,
  MapPin,
  RefreshCcw,
  Settings,
  Trash2,
  Users,
  Mail,
  UserCheck,
  FileText,
} from "lucide-react";
import { api, City, CityStats, User, Invitation } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { useToast } from "@/context/ToastContext";
import CityCreateWizard from "@/components/cities/CityCreateWizard";
import CitySettingsModal from "@/components/cities/CitySettingsModal";
import { integrationTypeLabel } from "@/lib/cityContract";
import { CITY_FEATURE_OPTIONS } from "@/lib/cityFeatures";
import { useConfirmDialog } from "@/context/ConfirmDialogContext";
import PageHeader from "@/components/PageHeader";
import PageShell from "@/components/PageShell";
import RequirePermission from "@/components/RequirePermission";
import { usePanelRole } from "@/context/PanelRoleContext";
import { PanelPermission } from "@/lib/panelPermissions";

export default function CitiesPage() {
  const { toast } = useToast();
  const { confirm } = useConfirmDialog();
  const { can } = usePanelRole();
  const canEditCities = can(PanelPermission.CITIES_EDIT);
  const canManageAgents = can(PanelPermission.AGENTS);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [isAgentsModalOpen, setIsAgentsModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [cityAgents, setCityAgents] = useState<User[]>([]);
  const [cityInvitations, setCityInvitations] = useState<Invitation[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [mayorForm, setMayorForm] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
  });
  const [mayorSaving, setMayorSaving] = useState(false);

  // Stats for the chart
  const [cityStats, setCityStats] = useState<CityStats[]>([]);

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchAll = async () => {
      setIsLoading(true);
      const data = await api.getCities();
      if (isMounted && data) setCities(data);

      const stats = await api.getCityStats();
      if (isMounted && stats) setCityStats(stats);

      if (isMounted) setIsLoading(false);
    };
    fetchAll();
    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const closeAgentsModal = useCallback(() => setIsAgentsModalOpen(false), []);

  useEffect(() => {
    if (!isAgentsModalOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeAgentsModal(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAgentsModalOpen, closeAgentsModal]);

  const handleDeleteCity = async (id: string) => {
    const city = cities.find((c) => c.id === id);
    const ok = await confirm({
      title: "Supprimer cette ville ?",
      description: "Action irréversible",
      message: `Êtes-vous sûr de vouloir supprimer ${city?.name ?? "cette ville"} et toutes ses configurations ?`,
      confirmLabel: "Supprimer",
      variant: "danger",
    });
    if (!ok) return;
    const success = await api.deleteCity(id);
    if (success) {
      setCities(cities.filter((c) => c.id !== id));
      setRefreshKey((prev) => prev + 1);
    } else {
      toast("error", "Impossible de supprimer la ville.");
    }
  };

  const handleOpenSettings = (city: City) => {
    setSelectedCity(city);
    setIsSettingsModalOpen(true);
  };

  const handleSaveCitySettings = async (draft: City) => {
    setSettingsSaving(true);
    const updated = await api.updateCity(draft.id, {
      contractNumber: draft.contractNumber?.trim() || undefined,
      contractSignedAt: draft.contractSignedAt || undefined,
      contractNotes: draft.contractNotes?.trim() || undefined,
      municipalityContactName:
        draft.municipalityContactName?.trim() || undefined,
      municipalityContactRole:
        draft.municipalityContactRole?.trim() || undefined,
      municipalityContactEmail:
        draft.municipalityContactEmail?.trim() || undefined,
      municipalityContactPhone:
        draft.municipalityContactPhone?.trim() || undefined,
      contactEmail: draft.contactEmail?.trim() || undefined,
      contactPhone: draft.contactPhone?.trim() || undefined,
      contactHelpText: draft.contactHelpText?.trim() || undefined,
      assignedTechName: draft.assignedTechName?.trim() || undefined,
      assignedTechEmail: draft.assignedTechEmail?.trim() || undefined,
      salesRepName: draft.salesRepName?.trim() || undefined,
      salesRepEmail: draft.salesRepEmail?.trim() || undefined,
      integrationType: draft.integrationType,
      primaryColor: draft.primaryColor,
      logoUrl: draft.logoUrl?.trim() || undefined,
      features: draft.features,
      isTransportFeatureAllowed: !!draft.isTransportFeatureAllowed,
      isTransportFeatureEnabled: draft.isTransportFeatureAllowed
        ? !!draft.isTransportFeatureEnabled
        : false,
      dataRetentionPolicy: draft.dataRetentionPolicy?.trim() || undefined,
    });
    setSettingsSaving(false);
    if (updated) {
      setCities(cities.map((c) => (c.id === updated.id ? updated : c)));
      setSelectedCity(updated);
      setIsSettingsModalOpen(false);
      toast("success", `Configuration de ${updated.name} enregistrée.`);
    } else {
      toast("error", "Échec de la mise à jour.");
    }
  };

  const handleOpenAgents = async (city: City) => {
    setSelectedCity(city);
    setIsAgentsModalOpen(true);
    const agents = await api.getCityAgents(city.id);
    const invitations = await api.getCityInvitations(city.id);
    setCityAgents(agents || []);
    setCityInvitations(invitations || []);
  };

  const handleAddInvitation = async () => {
    if (!selectedCity || !inviteEmail) return;
    const invite = await api.createInvitation(selectedCity.id, {
      email: inviteEmail,
    });
    if (invite) {
      setCityInvitations([invite, ...cityInvitations]);
      setInviteEmail("");
    } else {
      toast("error", "Impossible d'envoyer l'invitation.");
    }
  };

  const handleCreateMayor = async () => {
    if (!selectedCity) return;
    if (!mayorForm.name.trim() || !mayorForm.surname.trim()) {
      toast("error", "Le prénom et le nom sont obligatoires.");
      return;
    }
    if (!mayorForm.email.trim()) {
      toast("error", "L'e-mail est obligatoire.");
      return;
    }
    if (mayorForm.password.length < 8) {
      toast("error", "Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setMayorSaving(true);
    try {
      const mayor = await api.createMayor(selectedCity.id, {
        name: mayorForm.name.trim(),
        surname: mayorForm.surname.trim(),
        email: mayorForm.email.trim(),
        password: mayorForm.password,
      });
      toast("success", `Compte maire créé pour ${mayor.email}`);
      setMayorForm({ name: "", surname: "", email: "", password: "" });
      const agents = await api.getCityAgents(selectedCity.id);
      setCityAgents(agents || []);
      setRefreshKey((k) => k + 1);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Impossible de créer le compte maire.";
      toast("error", message);
    } finally {
      setMayorSaving(false);
    }
  };

  const handleForceAccept = async (invitationId: number) => {
    const success = await api.forceAcceptInvitation(invitationId);
    if (success && selectedCity) {
      const agents = await api.getCityAgents(selectedCity.id);
      const invitations = await api.getCityInvitations(selectedCity.id);
      setCityAgents(agents || []);
      setCityInvitations(invitations || []);
      setRefreshKey((prev) => prev + 1);
    } else {
      toast("error", "Impossible d'accepter l'invitation.");
    }
  };

  return (
    <RequirePermission permission={PanelPermission.CITIES_VIEW}>
    <PageShell>
      <PageHeader
        title="Villes partenaires"
        description={
          canEditCities
            ? "Gérez vos contrats et visualisez les territoires couverts."
            : "Consultation des villes partenaires et de leur couverture."
        }
        actions={
          canEditCities ? (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="btn-primary"
            >
              <Plus className="h-4 w-4" />
              Ajouter une ville
            </button>
          ) : undefined
        }
      />

      {/* Stats & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 shrink-0">
        <div className="card-panel flex flex-col justify-center p-6">
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-municipall-blue/[0.08]">
              <Building2 className="h-5 w-5 text-municipall-blue" />
            </div>
            <div>
              <h3 className="section-title">Villes actives</h3>
              <p className="text-2xl font-semibold tabular-nums text-slate-900">
                {cities.length}
              </p>
            </div>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
            Répartition en temps réel des utilisateurs
          </div>
        </div>

        <div className="card-panel lg:col-span-2 p-6">
          <h3 className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Users className="w-4 h-4 text-municipall-blue" />
            Engagement par Ville
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityStats}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f3f4f6"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9ca3af", fontWeight: 600 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                />
                <Tooltip
                  cursor={{ fill: "#f9fafb" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: "10px",
                    fontWeight: 600,
                    paddingTop: "10px",
                  }}
                />
                <Bar
                  dataKey="users"
                  name="Citoyens"
                  fill="#244FE5"
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
                <Bar
                  dataKey="agents"
                  name="Agents Actifs"
                  fill="#93c5fd"
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
                <Bar
                  dataKey="pending"
                  name="Invitations"
                  fill="#e2e8f0"
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Cities List */}
      <h3 className="mb-4 text-sm font-semibold text-slate-900">
        Territoires couverts
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-12">
            <RefreshCcw className="h-7 w-7 animate-spin text-slate-300" />
          </div>
        ) : (
          cities.map((city) => (
            <div key={city.id} className="card-panel group flex flex-col p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-inner"
                    style={{ backgroundColor: city.primaryColor || "#244FE5" }}
                  >
                    {city.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{city.name}</h4>
                    <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> PostGIS Boundary
                    </p>
                    {city.contractNumber && (
                      <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                        <FileText className="w-3 h-3" /> {city.contractNumber}
                      </p>
                    )}
                    {city.integrationType && (
                      <p className="text-[10px] text-municipall-blue font-semibold mt-1">
                        {integrationTypeLabel(city.integrationType)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {canManageAgents && (
                    <button
                      onClick={() => handleOpenAgents(city)}
                      className="p-2 text-gray-400 hover:text-municipall-blue hover:bg-blue-50 rounded-lg transition-colors"
                      aria-label="Gérer les agents"
                    >
                      <Users className="w-4 h-4" />
                    </button>
                  )}
                  {canEditCities && (
                    <>
                      <button
                        onClick={() => handleOpenSettings(city)}
                        className="p-2 text-gray-400 hover:text-municipall-blue hover:bg-blue-50 rounded-lg transition-colors"
                        aria-label="Réglages"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCity(city.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {city.features?.map((f: string) => {
                  const label =
                    CITY_FEATURE_OPTIONS.find((o) => o.id === f)?.label ?? f;
                  return (
                    <span
                      key={f}
                      className="px-2 py-0.5 bg-gray-50 text-gray-400 text-[10px] font-bold uppercase rounded border border-gray-100"
                    >
                      {label}
                    </span>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <CityCreateWizard
        open={isAddModalOpen}
        canCreateMayor={canManageAgents}
        onClose={() => setIsAddModalOpen(false)}
        onCreated={(savedCity, meta) => {
          setCities([...cities, savedCity]);
          setRefreshKey((prev) => prev + 1);
          const mayorPart = meta?.mayorEmail
            ? ` Compte maire créé (${meta.mayorEmail}).`
            : "";
          toast(
            "success",
            `La ville de ${savedCity.name} a été intégrée avec succès !${mayorPart}`,
          );
        }}
        onError={(message) => toast("error", message)}
      />

      {isSettingsModalOpen && selectedCity && (
        <CitySettingsModal
          city={selectedCity}
          saving={settingsSaving}
          onClose={() => setIsSettingsModalOpen(false)}
          onSave={handleSaveCitySettings}
        />
      )}

      {/* Agents Modal (Real Agents & Invitations) */}
      {isAgentsModalOpen && selectedCity && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeAgentsModal}>
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-extrabold text-gray-900">
                Agents: {selectedCity.name}
              </h3>
              <button
                onClick={() => setIsAgentsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold p-2"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-8">
              {/* Mayor account */}
              <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                <h4 className="text-sm font-bold text-emerald-800 mb-3">
                  Créer le compte maire (onboarding commune)
                </h4>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    placeholder="Prénom"
                    value={mayorForm.name}
                    onChange={(e) =>
                      setMayorForm({ ...mayorForm, name: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  />
                  <input
                    placeholder="Nom"
                    value={mayorForm.surname}
                    onChange={(e) =>
                      setMayorForm({ ...mayorForm, surname: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  />
                  <input
                    type="email"
                    placeholder="maire@commune.fr"
                    value={mayorForm.email}
                    onChange={(e) =>
                      setMayorForm({ ...mayorForm, email: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm sm:col-span-2"
                  />
                  <input
                    type="password"
                    placeholder="Mot de passe initial"
                    value={mayorForm.password}
                    onChange={(e) =>
                      setMayorForm({ ...mayorForm, password: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm sm:col-span-2"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCreateMayor}
                  disabled={mayorSaving}
                  className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm disabled:opacity-50"
                >
                  {mayorSaving ? "Création…" : "Créer le maire"}
                </button>
              </div>

              {/* Invite Section */}
              <div className="bg-municipall-blue/5 p-5 rounded-2xl border border-municipall-blue/10">
                <h4 className="text-sm font-bold text-municipall-blue mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Inviter un nouvel agent
                </h4>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="email@commune.fr"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-municipall-blue"
                  />
                  <button
                    onClick={handleAddInvitation}
                    className="px-4 py-2 bg-municipall-blue text-white rounded-xl font-bold text-sm"
                  >
                    Envoyer
                  </button>
                </div>
              </div>

              {/* Agents List */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-green-500" /> Agents Actifs
                  ({cityAgents.length})
                </h4>
                <div className="space-y-2">
                  {cityAgents.map((agent) => (
                    <div
                      key={agent.id}
                      className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-500">
                          {agent.name.charAt(0)}
                          {agent.surname.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {agent.name} {agent.surname}
                          </p>
                          <p className="text-xs text-gray-500">{agent.email}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-black uppercase rounded">
                        Actif
                      </span>
                    </div>
                  ))}
                  {cityAgents.length === 0 && (
                    <p className="text-center text-xs text-gray-400 py-4">
                      Aucun agent actif pour le moment.
                    </p>
                  )}
                </div>
              </div>

              {/* Pending Invitations */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <RefreshCcw className="w-4 h-4 text-orange-500" /> Invitations
                  en attente ({cityInvitations.length})
                </h4>
                <div className="space-y-2">
                  {cityInvitations.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl"
                    >
                      <p className="text-sm font-medium text-gray-600">
                        {inv.email}
                      </p>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleForceAccept(inv.id)}
                          className="px-2 py-1 bg-municipall-blue/10 text-municipall-blue text-[10px] font-black uppercase rounded hover:bg-municipall-blue hover:text-white transition-colors"
                        >
                          Accept (Test)
                        </button>
                        <span className="text-[10px] font-bold text-gray-400">
                          {new Date(inv.createdAt).toLocaleDateString()}
                        </span>
                        <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-black uppercase rounded">
                          Pending
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageShell>
    </RequirePermission>
  );
}
