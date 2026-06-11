export const CITY_FEATURE_OPTIONS = [
  {
    id: "flux-live",
    label: "Flux en direct",
    description: "Fil d'actualités et annonces municipales.",
  },
  {
    id: "agenda",
    label: "Agenda",
    description: "Événements et vie locale.",
  },
  {
    id: "reports",
    label: "Signalements",
    description: "Signalements citoyens sur la carte.",
  },
  {
    id: "weather",
    label: "Météo",
    description: "Bulletin météo local.",
  },
  {
    id: "security",
    label: "Sécurité",
    description: "Alertes et informations de sécurité.",
  },
  {
    id: "contact",
    label: "Contact",
    description: "Formulaire de contact avec la mairie.",
  },
  {
    id: "social",
    label: "Vie associative",
    description: "Associations et groupes de parole.",
  },
] as const;

export type CityFeatureId = (typeof CITY_FEATURE_OPTIONS)[number]["id"];

export const DEFAULT_CITY_FEATURES: CityFeatureId[] = [
  "flux-live",
  "agenda",
  "reports",
];
