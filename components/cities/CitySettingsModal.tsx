"use client";

import React, { useEffect, useState } from "react";
import type { City, CityIntegrationType } from "@/lib/api";
import { CITY_FEATURE_OPTIONS } from "@/lib/cityFeatures";
import { INTEGRATION_TYPE_OPTIONS } from "@/lib/cityContract";

type SettingsTab = "contract" | "contacts" | "modules";

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "contract", label: "Contrat" },
  { id: "contacts", label: "Contacts" },
  { id: "modules", label: "Modules" },
];

const inputClass =
  "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-municipall-blue";
const labelClass =
  "mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500";

export type CitySettingsModalProps = {
  city: City;
  saving: boolean;
  onClose: () => void;
  onSave: (city: City) => void;
};

export default function CitySettingsModal({
  city,
  saving,
  onClose,
  onSave,
}: CitySettingsModalProps) {
  const [tab, setTab] = useState<SettingsTab>("contract");
  const [draft, setDraft] = useState<City>(city);

  useEffect(() => {
    setDraft(city);
    setTab("contract");
  }, [city]);

  const patch = (partial: Partial<City>) =>
    setDraft((prev) => ({ ...prev, ...partial }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 p-6">
          <h3 className="text-xl font-extrabold text-gray-900">
            Configuration : {city.name}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 font-bold text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="flex shrink-0 gap-1 border-b border-gray-100 px-6 py-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                tab === t.id
                  ? "bg-municipall-blue/10 text-municipall-blue"
                  : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {tab === "contract" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass}>Numéro de contrat</label>
                <input
                  type="text"
                  value={draft.contractNumber ?? ""}
                  onChange={(e) => patch({ contractNumber: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Date de signature</label>
                <input
                  type="date"
                  value={draft.contractSignedAt?.slice(0, 10) ?? ""}
                  onChange={(e) =>
                    patch({
                      contractSignedAt: e.target.value || undefined,
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Type d&apos;intégration</label>
                <select
                  value={draft.integrationType ?? "mobile_app"}
                  onChange={(e) =>
                    patch({
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
                  value={draft.contractNotes ?? ""}
                  onChange={(e) => patch({ contractNotes: e.target.value })}
                  rows={3}
                  className={`${inputClass} resize-y`}
                />
              </div>
              <div>
                <label className={labelClass}>Commercial</label>
                <input
                  type="text"
                  value={draft.salesRepName ?? ""}
                  onChange={(e) => patch({ salesRepName: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>E-mail commercial</label>
                <input
                  type="email"
                  value={draft.salesRepEmail ?? ""}
                  onChange={(e) => patch({ salesRepEmail: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Tech attitré</label>
                <input
                  type="text"
                  value={draft.assignedTechName ?? ""}
                  onChange={(e) => patch({ assignedTechName: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>E-mail tech</label>
                <input
                  type="email"
                  value={draft.assignedTechEmail ?? ""}
                  onChange={(e) => patch({ assignedTechEmail: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {tab === "contacts" && (
            <div className="space-y-6">
              <div>
                <p className="mb-3 text-sm font-bold text-gray-900">
                  Interlocuteur mairie (CRM)
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Nom</label>
                    <input
                      type="text"
                      value={draft.municipalityContactName ?? ""}
                      onChange={(e) =>
                        patch({ municipalityContactName: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Fonction</label>
                    <input
                      type="text"
                      value={draft.municipalityContactRole ?? ""}
                      onChange={(e) =>
                        patch({ municipalityContactRole: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>E-mail</label>
                    <input
                      type="email"
                      value={draft.municipalityContactEmail ?? ""}
                      onChange={(e) =>
                        patch({ municipalityContactEmail: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Téléphone</label>
                    <input
                      type="tel"
                      value={draft.municipalityContactPhone ?? ""}
                      onChange={(e) =>
                        patch({ municipalityContactPhone: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
              <div>
                <p className="mb-3 text-sm font-bold text-gray-900">
                  Contact affiché dans l&apos;app
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>E-mail public</label>
                    <input
                      type="email"
                      value={draft.contactEmail ?? ""}
                      onChange={(e) => patch({ contactEmail: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Téléphone public</label>
                    <input
                      type="tel"
                      value={draft.contactPhone ?? ""}
                      onChange={(e) => patch({ contactPhone: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Texte d&apos;aide</label>
                    <textarea
                      value={draft.contactHelpText ?? ""}
                      onChange={(e) =>
                        patch({ contactHelpText: e.target.value })
                      }
                      rows={2}
                      className={`${inputClass} resize-y`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "modules" && (
            <div className="space-y-6">
              <div>
                <label className={labelClass}>Couleur primaire</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={draft.primaryColor || "#244FE5"}
                    onChange={(e) => patch({ primaryColor: e.target.value })}
                    className="h-10 w-10 cursor-pointer rounded-lg border-0 p-0"
                  />
                  <input
                    type="text"
                    value={draft.primaryColor || "#244FE5"}
                    onChange={(e) => patch({ primaryColor: e.target.value })}
                    className={`${inputClass} flex-1 font-mono`}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>URL du logo</label>
                <input
                  type="url"
                  value={draft.logoUrl ?? ""}
                  onChange={(e) => patch({ logoUrl: e.target.value })}
                  placeholder="https://..."
                  className={inputClass}
                />
              </div>
              <div>
                <p className="mb-3 text-sm font-bold text-gray-900">
                  Modules activés
                </p>
                <label className="mb-4 flex cursor-pointer items-center justify-between rounded-xl border-2 border-indigo-100 bg-indigo-50/50 p-4 transition-colors hover:bg-indigo-50">
                  <div>
                    <span className="block text-sm font-bold text-gray-900">
                      Transports en commun (IDFM)
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      Autorisé par le contrat plateforme.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!draft.isTransportFeatureAllowed}
                    onChange={(e) =>
                      patch({
                        isTransportFeatureAllowed: e.target.checked,
                        isTransportFeatureEnabled: e.target.checked
                          ? draft.isTransportFeatureEnabled
                          : false,
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
                    <span className="text-sm font-bold text-gray-700">
                      {feature.label}
                    </span>
                    <input
                      type="checkbox"
                      checked={draft.features?.includes(feature.id) ?? false}
                      onChange={(e) => {
                        const current = draft.features ?? [];
                        patch({
                          features: e.target.checked
                            ? [...current, feature.id]
                            : current.filter((f) => f !== feature.id),
                        });
                      }}
                      className="h-5 w-5 rounded border-gray-300 text-municipall-blue focus:ring-municipall-blue"
                    />
                  </label>
                ))}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Durées de conservation (RGPD)
                </label>
                <textarea
                  value={draft.dataRetentionPolicy ?? ""}
                  onChange={(e) =>
                    patch({ dataRetentionPolicy: e.target.value })
                  }
                  rows={5}
                  className={`${inputClass} resize-y`}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t border-gray-100 p-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-5 py-2.5 font-bold text-gray-600 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => onSave(draft)}
            disabled={saving}
            className="rounded-xl bg-municipall-blue px-5 py-2.5 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
