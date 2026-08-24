"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  MapPin,
  Palette,
  Puzzle,
  RefreshCcw,
  Search,
  UserCheck,
  UserRound,
  Users,
} from "lucide-react";
import { api, City } from "@/lib/api";
import {
  CITY_FEATURE_OPTIONS,
  DEFAULT_CITY_FEATURES,
  CityFeatureId,
} from "@/lib/cityFeatures";
import {
  CityIntegrationType,
  INTEGRATION_TYPE_OPTIONS,
} from "@/lib/cityContract";

export interface GouvGeoFeature {
  type: string;
  geometry: unknown;
  properties: {
    nom: string;
    code: string;
    codesPostaux?: string[];
    population?: number;
  };
}

type WizardStep = 0 | 1 | 2 | 3 | 4 | 5;

const BASE_STEPS: { title: string; icon: React.ElementType }[] = [
  { title: "Territoire", icon: MapPin },
  { title: "Contrat", icon: FileText },
  { title: "Contacts", icon: UserRound },
  { title: "Modules", icon: Puzzle },
  { title: "Branding", icon: Palette },
];

const MAYOR_STEP = { title: "Maire", icon: UserCheck };

export type CityCreateWizardProps = {
  open: boolean;
  canCreateMayor?: boolean;
  onClose: () => void;
  onCreated: (city: City, meta?: { mayorEmail?: string }) => void;
  onError: (message: string) => void;
};

function slugifyCityName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "-");
}

const initialForm = {
  contractNumber: "",
  contractSignedAt: "",
  contractNotes: "",
  salesRepName: "",
  salesRepEmail: "",
  assignedTechName: "",
  assignedTechEmail: "",
  municipalityContactName: "",
  municipalityContactRole: "",
  municipalityContactEmail: "",
  municipalityContactPhone: "",
  contactEmail: "",
  contactPhone: "",
  contactHelpText: "",
  integrationType: "mobile_app" as CityIntegrationType,
  features: [...DEFAULT_CITY_FEATURES] as CityFeatureId[],
  isTransportFeatureAllowed: false,
  primaryColor: "#244FE5",
  logoUrl: "",
  dataRetentionPolicy: "",
};

export default function CityCreateWizard({
  open,
  canCreateMayor = false,
  onClose,
  onCreated,
  onError,
}: CityCreateWizardProps) {
  const steps = canCreateMayor ? [...BASE_STEPS, MAYOR_STEP] : BASE_STEPS;
  const lastStep = (steps.length - 1) as WizardStep;

  const [step, setStep] = useState<WizardStep>(0);
  const [saving, setSaving] = useState(false);
  const [createMayor, setCreateMayor] = useState(false);
  const [mayorForm, setMayorForm] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GouvGeoFeature[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCityGeo, setSelectedCityGeo] = useState<GouvGeoFeature | null>(
    null,
  );
  const [cityName, setCityName] = useState("");
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setSaving(false);
    setSearchQuery("");
    setSearchResults([]);
    setIsSearching(false);
    setSelectedCityGeo(null);
    setCityName("");
    setForm(initialForm);
    setCreateMayor(false);
    setMayorForm({ name: "", surname: "", email: "", password: "" });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let isMounted = true;
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsSearching(true);
        try {
          const res = await fetch(
            `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(searchQuery)}&fields=nom,code,codesPostaux,contour&format=geojson&geometry=contour`,
          );
          const data = await res.json();
          if (isMounted && data.features) {
            setSearchResults(data.features.slice(0, 5) as GouvGeoFeature[]);
          }
        } catch (error) {
          console.error("Error fetching cities from data.gouv:", error);
        }
        if (isMounted) setIsSearching(false);
      } else if (isMounted) {
        setSearchResults([]);
      }
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(searchTimeout);
    };
  }, [searchQuery, open]);

  if (!open) return null;

  const handleSelectCity = (geoFeature: GouvGeoFeature) => {
    setSelectedCityGeo(geoFeature);
    setCityName(geoFeature.properties.nom);
    setSearchQuery("");
    setSearchResults([]);
  };

  const toggleFeature = (id: CityFeatureId, checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      features: checked
        ? [...prev.features, id]
        : prev.features.filter((f) => f !== id),
    }));
  };

  const stepError = (): string | null => {
    switch (step) {
      case 0:
        if (!selectedCityGeo || !cityName.trim()) {
          return "Sélectionnez une commune via la recherche Data.gouv.";
        }
        return null;
      case 1:
        if (!form.contractNumber.trim()) {
          return "Le numéro de contrat est obligatoire.";
        }
        if (!form.salesRepName.trim()) {
          return "Indiquez le commercial responsable.";
        }
        if (!form.assignedTechName.trim()) {
          return "Indiquez le tech Municip'All attitré.";
        }
        return null;
      case 2:
        if (!form.municipalityContactName.trim()) {
          return "Le nom du contact mairie est obligatoire.";
        }
        if (!form.municipalityContactEmail.trim()) {
          return "L'e-mail du contact mairie est obligatoire.";
        }
        return null;
      case 3:
        if (form.features.length === 0) {
          return "Activez au moins un module.";
        }
        return null;
      case 5:
        if (!createMayor) return null;
        if (!mayorForm.name.trim() || !mayorForm.surname.trim()) {
          return "Le prénom et le nom du maire sont obligatoires.";
        }
        if (!mayorForm.email.trim()) {
          return "L'e-mail du maire est obligatoire.";
        }
        if (mayorForm.password.length < 8) {
          return "Le mot de passe doit contenir au moins 8 caractères.";
        }
        return null;
      default:
        return null;
    }
  };

  const goNext = () => {
    const err = stepError();
    if (err) {
      onError(err);
      return;
    }
    setStep((s) => Math.min(lastStep, s + 1) as WizardStep);
  };

  const goBack = () => setStep((s) => Math.max(0, s - 1) as WizardStep);

  const handleSubmit = async () => {
    const err = stepError();
    if (err) {
      onError(err);
      return;
    }
    if (!selectedCityGeo) return;

    setSaving(true);
    const payload = {
      id: slugifyCityName(cityName),
      name: cityName,
      primaryColor: form.primaryColor,
      logoUrl: form.logoUrl.trim() || undefined,
      features: form.features,
      boundary: selectedCityGeo.geometry,
      dataRetentionPolicy: form.dataRetentionPolicy.trim() || undefined,
      contractNumber: form.contractNumber.trim(),
      contractSignedAt: form.contractSignedAt || undefined,
      contractNotes: form.contractNotes.trim() || undefined,
      municipalityContactName: form.municipalityContactName.trim(),
      municipalityContactRole: form.municipalityContactRole.trim() || undefined,
      municipalityContactEmail: form.municipalityContactEmail.trim(),
      municipalityContactPhone: form.municipalityContactPhone.trim() || undefined,
      contactEmail: form.contactEmail.trim() || undefined,
      contactPhone: form.contactPhone.trim() || undefined,
      contactHelpText: form.contactHelpText.trim() || undefined,
      assignedTechName: form.assignedTechName.trim(),
      assignedTechEmail: form.assignedTechEmail.trim() || undefined,
      salesRepName: form.salesRepName.trim(),
      salesRepEmail: form.salesRepEmail.trim() || undefined,
      integrationType: form.integrationType,
      isTransportFeatureAllowed: form.isTransportFeatureAllowed,
    };

    const savedCity = await api.addCity(payload);
    if (!savedCity) {
      setSaving(false);
      onError(
        "Échec de l'intégration. Vérifiez que l'API est accessible et que l'ID n'existe pas déjà.",
      );
      return;
    }

    let mayorEmail: string | undefined;
    if (canCreateMayor && createMayor) {
      try {
        const mayor = await api.createMayor(savedCity.id, {
          name: mayorForm.name.trim(),
          surname: mayorForm.surname.trim(),
          email: mayorForm.email.trim(),
          password: mayorForm.password,
        });
        mayorEmail = mayor.email;
      } catch (error) {
        setSaving(false);
        const message =
          error instanceof Error
            ? error.message
            : "La ville a été créée mais le compte maire n'a pas pu être créé.";
        onError(message);
        onCreated(savedCity);
        onClose();
        return;
      }
    }

    setSaving(false);
    onCreated(savedCity, mayorEmail ? { mayorEmail } : undefined);
    onClose();
  };

  const inputClass =
    "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-municipall-blue";
  const labelClass =
    "mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 bg-gray-50/50 p-6">
          <div>
            <h3 className="flex items-center gap-2 text-xl font-extrabold text-gray-900">
              <MapPin className="h-6 w-6 text-municipall-blue" />
              Intégrer une nouvelle ville
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Étape {step + 1} sur {steps.length} — {steps[step].title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 font-bold text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="flex shrink-0 gap-1 border-b border-gray-100 px-6 py-3">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const active = i === step;
            const done = i < step;
            return (
              <div
                key={s.title}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold ${
                  active
                    ? "bg-municipall-blue/10 text-municipall-blue"
                    : done
                      ? "text-green-600"
                      : "text-gray-400"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">{s.title}</span>
              </div>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 0 && (
            <div className="space-y-4">
              <div className="relative rounded-2xl border border-blue-100/50 bg-blue-50/50 p-5">
                <label className="mb-2 block text-sm font-bold text-gray-900">
                  Rechercher la commune (Data.gouv.fr)
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Saisissez le nom de la ville..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-municipall-blue"
                  />
                  {isSearching && (
                    <RefreshCcw className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
                  )}
                </div>
                {searchResults.length > 0 && (
                  <div className="absolute left-5 right-5 z-10 mt-2 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">
                    {searchResults.map((res, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectCity(res)}
                        className="flex w-full items-center justify-between border-b border-gray-50 px-4 py-3 text-left hover:bg-gray-50"
                      >
                        <span className="font-bold text-gray-900">
                          {res.properties.nom}
                        </span>
                        <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-400">
                          {res.properties.codesPostaux?.[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {selectedCityGeo && (
                <div className="flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 p-4 text-green-700">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-medium">
                    Limites géographiques récupérées pour{" "}
                    <strong>{cityName}</strong> (INSEE{" "}
                    {selectedCityGeo.properties.code}).
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass}>Numéro de contrat *</label>
                <input
                  type="text"
                  value={form.contractNumber}
                  onChange={(e) =>
                    setForm({ ...form, contractNumber: e.target.value })
                  }
                  placeholder="ex. MUN-2026-0042"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Date de signature</label>
                <input
                  type="date"
                  value={form.contractSignedAt}
                  onChange={(e) =>
                    setForm({ ...form, contractSignedAt: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Type d&apos;intégration</label>
                <select
                  value={form.integrationType}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      integrationType: e.target.value as CityIntegrationType,
                    })
                  }
                  className={inputClass}
                >
                  {INTEGRATION_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Notes contrat</label>
                <textarea
                  value={form.contractNotes}
                  onChange={(e) =>
                    setForm({ ...form, contractNotes: e.target.value })
                  }
                  rows={3}
                  placeholder="Conditions particulières, options facturées, échéances..."
                  className={`${inputClass} resize-y`}
                />
              </div>
              <div className="sm:col-span-2 mt-2 flex items-center gap-2 text-sm font-bold text-gray-900">
                <Users className="h-4 w-4 text-municipall-blue" />
                Équipe Municip&apos;All
              </div>
              <div>
                <label className={labelClass}>Commercial *</label>
                <input
                  type="text"
                  value={form.salesRepName}
                  onChange={(e) =>
                    setForm({ ...form, salesRepName: e.target.value })
                  }
                  placeholder="Prénom Nom"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>E-mail commercial</label>
                <input
                  type="email"
                  value={form.salesRepEmail}
                  onChange={(e) =>
                    setForm({ ...form, salesRepEmail: e.target.value })
                  }
                  placeholder="sales@municipall.fr"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Tech attitré *</label>
                <input
                  type="text"
                  value={form.assignedTechName}
                  onChange={(e) =>
                    setForm({ ...form, assignedTechName: e.target.value })
                  }
                  placeholder="Prénom Nom"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>E-mail tech</label>
                <input
                  type="email"
                  value={form.assignedTechEmail}
                  onChange={(e) =>
                    setForm({ ...form, assignedTechEmail: e.target.value })
                  }
                  placeholder="tech@municipall.fr"
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <p className="mb-3 text-sm font-bold text-gray-900">
                  Interlocuteur mairie (CRM interne)
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Nom *</label>
                    <input
                      type="text"
                      value={form.municipalityContactName}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          municipalityContactName: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Fonction</label>
                    <input
                      type="text"
                      value={form.municipalityContactRole}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          municipalityContactRole: e.target.value,
                        })
                      }
                      placeholder="ex. DGS, Responsable communication"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>E-mail *</label>
                    <input
                      type="email"
                      value={form.municipalityContactEmail}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          municipalityContactEmail: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Téléphone</label>
                    <input
                      type="tel"
                      value={form.municipalityContactPhone}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          municipalityContactPhone: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
              <div>
                <p className="mb-1 text-sm font-bold text-gray-900">
                  Contact affiché dans l&apos;app citoyenne
                </p>
                <p className="mb-3 text-xs text-gray-500">
                  Optionnel à la création — peut être complété dans le backoffice
                  mairie.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>E-mail public</label>
                    <input
                      type="email"
                      value={form.contactEmail}
                      onChange={(e) =>
                        setForm({ ...form, contactEmail: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Téléphone public</label>
                    <input
                      type="tel"
                      value={form.contactPhone}
                      onChange={(e) =>
                        setForm({ ...form, contactPhone: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Texte d&apos;aide</label>
                    <textarea
                      value={form.contactHelpText}
                      onChange={(e) =>
                        setForm({ ...form, contactHelpText: e.target.value })
                      }
                      rows={2}
                      placeholder="Horaires du standard, délais de réponse..."
                      className={`${inputClass} resize-y`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <label className="flex cursor-pointer items-center justify-between rounded-xl border-2 border-indigo-100 bg-indigo-50/50 p-4 transition-colors hover:bg-indigo-50">
                <div>
                  <span className="block text-sm font-bold text-gray-900">
                    Transports en commun (IDFM)
                  </span>
                  <span className="mt-1 block text-xs text-gray-500">
                    Module temps réel — autorisé par le contrat plateforme.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={form.isTransportFeatureAllowed}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      isTransportFeatureAllowed: e.target.checked,
                    })
                  }
                  className="h-5 w-5 rounded border-gray-300 text-municipall-blue focus:ring-municipall-blue"
                />
              </label>
              {CITY_FEATURE_OPTIONS.map((feature) => (
                <label
                  key={feature.id}
                  className="mb-2 flex cursor-pointer items-center justify-between rounded-xl border border-gray-100 p-3 transition-colors hover:bg-gray-50"
                >
                  <div>
                    <span className="text-sm font-bold text-gray-700">
                      {feature.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-gray-500">
                      {feature.description}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.features.includes(feature.id)}
                    onChange={(e) => toggleFeature(feature.id, e.target.checked)}
                    className="h-5 w-5 shrink-0 rounded border-gray-300 text-municipall-blue focus:ring-municipall-blue"
                  />
                </label>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Couleur primaire</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.primaryColor}
                    onChange={(e) =>
                      setForm({ ...form, primaryColor: e.target.value })
                    }
                    className="h-10 w-10 cursor-pointer rounded-lg border-0 p-0"
                  />
                  <input
                    type="text"
                    value={form.primaryColor}
                    onChange={(e) =>
                      setForm({ ...form, primaryColor: e.target.value })
                    }
                    className={`${inputClass} flex-1 font-mono`}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>URL du logo</label>
                <input
                  type="url"
                  value={form.logoUrl}
                  onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                  placeholder="https://..."
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Durées de conservation (RGPD)
                </label>
                <textarea
                  value={form.dataRetentionPolicy}
                  onChange={(e) =>
                    setForm({ ...form, dataRetentionPolicy: e.target.value })
                  }
                  rows={5}
                  placeholder="Ex. : Signalements conservés 36 mois après clôture..."
                  className={`${inputClass} resize-y`}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Affiché dans l&apos;app mobile pour les citoyens de cette
                  ville.
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
                <p className="font-bold text-gray-900">Récapitulatif</p>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>
                    <strong>Ville :</strong> {cityName || "—"}
                  </li>
                  <li>
                    <strong>Contrat :</strong> {form.contractNumber || "—"}
                  </li>
                  <li>
                    <strong>Intégration :</strong>{" "}
                    {
                      INTEGRATION_TYPE_OPTIONS.find(
                        (o) => o.value === form.integrationType,
                      )?.label
                    }
                  </li>
                  <li>
                    <strong>Modules :</strong> {form.features.join(", ")}
                  </li>
                  <li>
                    <strong>Commercial :</strong> {form.salesRepName}
                  </li>
                  <li>
                    <strong>Tech :</strong> {form.assignedTechName}
                  </li>
                </ul>
              </div>
            </div>
          )}

          {step === 5 && canCreateMayor && (
            <div className="space-y-4">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                <input
                  type="checkbox"
                  checked={createMayor}
                  onChange={(e) => setCreateMayor(e.target.checked)}
                  className="mt-0.5 h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="block text-sm font-bold text-gray-900">
                    Créer le compte maire maintenant
                  </span>
                  <span className="mt-1 block text-xs text-gray-500">
                    Optionnel — vous pourrez aussi le faire plus tard depuis la
                    gestion des agents.
                  </span>
                </div>
              </label>
              {createMayor && (
                <div className="grid gap-4 rounded-xl border border-gray-100 p-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Prénom *</label>
                    <input
                      type="text"
                      value={mayorForm.name}
                      onChange={(e) =>
                        setMayorForm({ ...mayorForm, name: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Nom *</label>
                    <input
                      type="text"
                      value={mayorForm.surname}
                      onChange={(e) =>
                        setMayorForm({ ...mayorForm, surname: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>E-mail *</label>
                    <input
                      type="email"
                      value={mayorForm.email}
                      onChange={(e) =>
                        setMayorForm({ ...mayorForm, email: e.target.value })
                      }
                      placeholder="maire@commune.fr"
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Mot de passe initial *</label>
                    <input
                      type="password"
                      value={mayorForm.password}
                      onChange={(e) =>
                        setMayorForm({ ...mayorForm, password: e.target.value })
                      }
                      className={inputClass}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Minimum 8 caractères. À communiquer de façon sécurisée au
                      maire.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex shrink-0 justify-between gap-3 border-t border-gray-100 bg-white p-6">
          <button
            type="button"
            onClick={step === 0 ? onClose : goBack}
            className="flex items-center gap-1 rounded-xl px-5 py-2.5 font-bold text-gray-600 transition-colors hover:bg-gray-50"
          >
            {step > 0 && <ChevronLeft className="h-4 w-4" />}
            {step === 0 ? "Annuler" : "Précédent"}
          </button>
          {step < lastStep ? (
            <button
              type="button"
              onClick={goNext}
              className="flex items-center gap-1 rounded-xl bg-municipall-blue px-5 py-2.5 font-bold text-white transition-colors hover:bg-blue-700"
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving || !selectedCityGeo}
              className="rounded-xl bg-municipall-blue px-5 py-2.5 font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {saving
                ? "Création…"
                : createMayor && step === 5
                  ? "Créer la ville et le maire"
                  : "Créer la ville"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
