"use client";

import React, { useState } from "react";
import { 
  UserPlus, 
  ShieldCheck, 
  Mail, 
  Building2, 
  Key,
  CheckCircle2,
  X
} from "lucide-react";
import clsx from "clsx";

export default function AgentsPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    city: "",
    permission: "standard"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to add agent would go here
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 5000);
    setFormData({ name: "", email: "", city: "", permission: "standard" });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-10">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Gestion des Agents</h2>
        <p className="text-sm text-gray-500 font-medium">Inscrivez de nouveaux agents municipaux et définissez leurs droits d&apos;accès.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <div className="card-panel p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-municipall-blue">
                <UserPlus className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Nouvel Agent</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nom complet</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="ex: Jean Dupont"
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-4 pr-4 py-3 text-sm focus:ring-2 focus:ring-municipall-blue/10 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Institutionnel</label>
                  <div className="relative">
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="agent@ville.gouv.fr"
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-municipall-blue/10 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Affectation (Ville)</label>
                <div className="relative">
                  <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <select 
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-municipall-blue/10 outline-none appearance-none transition-all"
                  >
                    <option value="">Sélectionner une ville...</option>
                    <option>Bouffémont</option>
                    <option>Domont</option>
                    <option>Ézanville</option>
                    <option>Cergy</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Niveau de Permissions</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, permission: "standard"})}
                    className={clsx(
                      "p-4 rounded-xl border text-left transition-all",
                      formData.permission === "standard" 
                        ? "bg-indigo-50 border-municipall-blue ring-1 ring-municipall-blue" 
                        : "bg-white border-gray-100 hover:border-gray-200"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <ShieldCheck className={clsx("w-4 h-4", formData.permission === "standard" ? "text-municipall-blue" : "text-gray-400")} />
                      <span className="text-sm font-bold">Standard</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-tight">Accès à la modération et aux signalements de sa ville uniquement.</p>
                  </button>

                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, permission: "admin"})}
                    className={clsx(
                      "p-4 rounded-xl border text-left transition-all",
                      formData.permission === "admin" 
                        ? "bg-indigo-50 border-municipall-blue ring-1 ring-municipall-blue" 
                        : "bg-white border-gray-100 hover:border-gray-200"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Key className={clsx("w-4 h-4", formData.permission === "admin" ? "text-municipall-blue" : "text-gray-400")} />
                      <span className="text-sm font-bold">Administrateur</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-tight">Peut gérer les autres agents et les paramètres de la ville.</p>
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full btn-primary py-4 justify-center">
                  <UserPlus className="w-5 h-5" />
                  Créer le compte agent
                </button>
              </div>

              {isSuccess && (
                <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex items-center gap-3 text-green-700 animate-in fade-in slide-in-from-bottom-2">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold">Compte créé avec succès !</p>
                    <p className="text-xs opacity-80">Un email d&apos;activation a été envoyé à l&apos;agent.</p>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card-panel p-6 bg-municipall-blue text-white overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-4">Conseils de Sécurité</h3>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">1</div>
                  <p className="text-xs text-white/80 leading-relaxed">Utilisez toujours l&apos;adresse email <strong>institutionnelle</strong> de l&apos;agent.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">2</div>
                  <p className="text-xs text-white/80 leading-relaxed">Vérifiez l&apos;identité de l&apos;agent avant de lui accorder des droits <strong>Administrateur</strong>.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">3</div>
                  <p className="text-xs text-white/80 leading-relaxed">Les accès peuvent être révoqués à tout moment depuis la liste des utilisateurs.</p>
                </li>
              </ul>
            </div>
            <ShieldCheck className="absolute -bottom-6 -right-6 w-32 h-32 text-white/5 -rotate-12" />
          </div>

          <div className="card-panel p-6">
            <h3 className="text-base font-bold text-gray-900 mb-6">Invitations en attente</h3>
            <div className="space-y-4">
              {[
                { name: "Marc Lévy", city: "Cergy", time: "Hier" },
                { name: "Julie Robert", city: "Bouffémont", time: "Il y a 2j" },
              ].map((inv, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{inv.name}</p>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{inv.city} • {inv.time}</p>
                  </div>
                  <button className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
