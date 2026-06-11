export type CityIntegrationType = "widget" | "mobile_app" | "both";

export const INTEGRATION_TYPE_OPTIONS: {
  value: CityIntegrationType;
  label: string;
  description: string;
}[] = [
  {
    value: "mobile_app",
    label: "Application mobile",
    description: "App Municip'All en marque blanche (iOS / Android).",
  },
  {
    value: "widget",
    label: "Widget web",
    description: "Module intégrable sur le site de la commune.",
  },
  {
    value: "both",
    label: "App + Widget",
    description: "Les deux canaux sont couverts par le contrat.",
  },
];

export function integrationTypeLabel(type?: string): string {
  return (
    INTEGRATION_TYPE_OPTIONS.find((o) => o.value === type)?.label ??
    type ??
    "—"
  );
}
