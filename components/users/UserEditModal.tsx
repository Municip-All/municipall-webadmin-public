"use client";

import React, { useState } from "react";
import { Calendar, MapPin, UserCircle, X } from "lucide-react";
import type { City, User } from "@/lib/api";
import { ROLE_OPTIONS, roleLabel } from "@/lib/userRoles";

export type UserEditForm = {
  name: string;
  surname: string;
  role: string;
  cityId: string;
  password: string;
};

type UserEditModalProps = {
  user: User;
  cities: City[];
  cityName: string;
  saving: boolean;
  onClose: () => void;
  onSave: (form: UserEditForm) => void;
};

function normalizeRoleValue(role: string): string {
  const n = role.trim().toLowerCase();
  if (n === "citoyen") return "citizen";
  if (n === "maire") return "mayor";
  if (n === "conseiller") return "assistant";
  return n;
}

function buildFormState(user: User): UserEditForm {
  return {
    name: user.name ?? "",
    surname: user.surname ?? "",
    role: normalizeRoleValue(user.role),
    cityId: user.cityId ?? "",
    password: "",
  };
}

export default function UserEditModal({
  user,
  cities,
  cityName,
  saving,
  onClose,
  onSave,
}: UserEditModalProps) {
  const [form, setForm] = useState<UserEditForm>(() => buildFormState(user));

  const isStaff = ["mayor", "assistant", "agent"].includes(form.role);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {user.name} {user.surname}
            </h3>
            <p className="mt-0.5 text-sm text-slate-500">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto px-6 py-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="section-title mb-1.5 block">Prénom</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="section-title mb-1.5 block">Nom</label>
              <input
                type="text"
                value={form.surname}
                onChange={(e) => setForm({ ...form, surname: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="section-title mb-1.5 block">Rôle</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="input-field"
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-slate-500">
              Rôle actuel en base : {roleLabel(user.role)}
            </p>
          </div>

          <div>
            <label className="section-title mb-1.5 block">Ville</label>
            <select
              value={form.cityId}
              onChange={(e) => setForm({ ...form, cityId: e.target.value })}
              className="input-field"
            >
              <option value="">Aucune</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
            {isStaff && !form.cityId && (
              <p className="mt-1.5 text-xs text-amber-600">
                Obligatoire pour un compte maire, assistant ou agent.
              </p>
            )}
          </div>

          <div>
            <label className="section-title mb-1.5 block">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Laisser vide pour ne pas modifier"
              className="input-field"
              autoComplete="new-password"
            />
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-400" />
              <span>{cityName}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <UserCircle className="h-4 w-4 text-slate-400" />
              <span>ID #{user.id}</span>
              {typeof user.points === "number" && (
                <span className="text-slate-400">· {user.points} pts</span>
              )}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>
                Inscrit le{" "}
                {user.created_at
                  ? new Date(user.created_at).toLocaleDateString("fr-FR")
                  : "—"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button type="button" onClick={onClose} className="btn-secondary">
            Annuler
          </button>
          <button
            type="button"
            disabled={saving || (isStaff && !form.cityId)}
            onClick={() => onSave(form)}
            className="btn-primary"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
