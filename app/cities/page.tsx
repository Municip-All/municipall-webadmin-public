"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Plus, 
  MapPin, 
  RefreshCcw,
  Search,
  CheckCircle2
} from "lucide-react";
import { api, City, CityStats } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface GouvGeoFeature {
  type: string;
  geometry: unknown;
  properties: {
    nom: string;
    code: string;
    codesPostaux?: string[];
    population?: number;
  };
}

export default function CitiesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Stats for the chart
  const [cityStats, setCityStats] = useState<CityStats[]>([]);

  // Add City Form State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GouvGeoFeature[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCityGeo, setSelectedCityGeo] = useState<GouvGeoFeature | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    primaryColor: "#244FE5",
    logoUrl: "",
    features: "flux-live,agenda,reports"
  });

  useEffect(() => {
    let isMounted = true;
    const fetchCities = async () => {
      setIsLoading(true);
      const data = await api.getCities();
      if (isMounted && data) {
        setCities(data);
      }
      
      // Fetch real stats
      const stats = await api.getCityStats();
      if (isMounted && stats) {
        setCityStats(stats);
      }
      
      if (isMounted) setIsLoading(false);
    };
    fetchCities();
    return () => { isMounted = false; };
  }, []);

  // Search Data.gouv API
  useEffect(() => {
    let isMounted = true;
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsSearching(true);
        try {
          const res = await fetch(`https://geo.api.gouv.fr/communes?nom=${searchQuery}&fields=nom,code,codesPostaux,contour&format=geojson&geometry=contour`);
          const data = await res.json();
          // Data Gouv GeoJSON features
          if (isMounted && data.features) {
            setSearchResults(data.features.slice(0, 5) as GouvGeoFeature[]);
          }
        } catch (error) {
          console.error("Error fetching cities from data.gouv:", error);
        }
        if (isMounted) setIsSearching(false);
      } else {
        if (isMounted) setSearchResults([]);
      }
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(searchTimeout);
    };
  }, [searchQuery]);

  const handleSelectCity = (geoFeature: GouvGeoFeature) => {
    const properties = geoFeature.properties;
    setSelectedCityGeo(geoFeature);
    setFormData({ ...formData, name: properties.nom });
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSaveCity = async () => {
    if (!selectedCityGeo || !formData.name) return;
    
    const newCityPayload = {
      id: formData.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '-'),
      name: formData.name,
      primaryColor: formData.primaryColor,
      logoUrl: formData.logoUrl,
      features: formData.features.split(',').map(f => f.trim()),
      boundary: selectedCityGeo.geometry
    };

    const savedCity = await api.addCity(newCityPayload);
    
    if (savedCity) {
      setCities([...cities, savedCity]);
      setIsAddModalOpen(false);
      setSelectedCityGeo(null);
      setFormData({ ...formData, name: "" });
    }
  };

  return (
    <div className="p-8 h-screen flex flex-col overflow-auto">
      <header className="mb-8 flex items-end justify-between shrink-0">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Villes Partenaires</h2>
          <p className="text-sm text-gray-500 font-medium">Gérez vos contrats et visualisez les territoires couverts.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-municipall-blue text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-municipall-blue/20"
        >
          <Plus className="w-5 h-5" />
          Ajouter une Ville
        </button>
      </header>

      {/* Stats & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 shrink-0">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-municipall-blue" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Villes Actives</h3>
              <p className="text-3xl font-black text-gray-900">{cities.length}</p>
            </div>
          </div>
          <div className="text-xs font-medium text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
            Croissance de +15% ce mois-ci
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
            <UsersIcon className="w-4 h-4 text-municipall-blue" />
            Utilisateurs par Ville Partenaire
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="users" name="Citoyens" fill="#244FE5" radius={[4, 4, 0, 0]} barSize={32} />
                <Bar dataKey="agents" name="Agents" fill="#93c5fd" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Cities List */}
      <h3 className="text-lg font-bold text-gray-900 mb-4">Territoires Couverts</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-12"><RefreshCcw className="w-8 h-8 animate-spin text-gray-300" /></div>
        ) : cities.map((city) => (
          <div key={city.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between group">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-inner"
                style={{ backgroundColor: city.primaryColor || '#244FE5' }}
              >
                {city.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{city.name}</h4>
                <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" /> PostGIS Sync
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              {city.features?.slice(0, 2).map((f: string) => (
                <span key={f} className="px-2 py-1 bg-gray-50 text-gray-500 text-[10px] font-bold uppercase rounded border border-gray-100">
                  {f}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add City Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
              <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-municipall-blue" />
                Intégrer une nouvelle ville
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold p-2">✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
              {/* Step 1: Search API */}
              <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50 relative">
                <label className="block text-sm font-bold text-gray-900 mb-2">1. Rechercher la commune (Data.gouv.fr)</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Saisissez le nom de la ville..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-municipall-blue outline-none"
                  />
                  {isSearching && <RefreshCcw className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />}
                </div>

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-5 right-5 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-10 overflow-hidden">
                    {searchResults.map((res: GouvGeoFeature, idx) => (
                      <button 
                        key={idx}
                        onClick={() => handleSelectCity(res)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 flex items-center justify-between"
                      >
                        <span className="font-bold text-gray-900">{res.properties.nom}</span>
                        <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{res.properties.codesPostaux?.[0]}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 2: Confirmation & Details */}
              {selectedCityGeo && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 mb-6">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">
                      Limites géographiques (Polygone) récupérées avec succès pour <strong>{formData.name}</strong>.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Couleur Primaire</label>
                        <div className="flex items-center gap-3">
                          <input 
                            type="color" 
                            value={formData.primaryColor}
                            onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
                            className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                          />
                          <input 
                            type="text" 
                            value={formData.primaryColor}
                            onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
                            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-municipall-blue outline-none"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Modules Activés (séparés par virgule)</label>
                        <input 
                          type="text" 
                          value={formData.features}
                          onChange={(e) => setFormData({...formData, features: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-municipall-blue outline-none"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-gray-100 rounded-xl border border-gray-200 overflow-hidden relative flex flex-col">
                       {/* Map Preview Placeholder if Leaflet is not yet ready */}
                       <div className="flex-1 bg-gray-50 flex items-center justify-center p-6 text-center">
                         <div>
                            <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-xs font-bold text-gray-400">Aperçu Carte</p>
                            <p className="text-[10px] text-gray-400 mt-2 font-mono bg-white p-2 rounded border border-gray-200 inline-block">
                              GeoJSON: {JSON.stringify(selectedCityGeo.geometry).substring(0, 40)}...
                            </p>
                         </div>
                       </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-white">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={handleSaveCity}
                disabled={!selectedCityGeo}
                className="px-5 py-2.5 rounded-xl font-bold text-white bg-municipall-blue hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-md shadow-municipall-blue/20"
              >
                Enregistrer la ville
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Small icon helper
function UsersIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
