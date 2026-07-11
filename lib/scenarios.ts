// Frontend mirror of the backend scenario metadata (backend/app/engine/scenarios.py).
// Only presentation fields live here; all KPI numbers come from the API.

export interface ScenarioMeta {
  id: string;
  key: string; // keyboard label, e.g. "[1]"
  name: string;
  severity: "high" | "medium" | "low";
  severityLabel: string;
  description: string;
}

export const SCENARIOS: ScenarioMeta[] = [
  {
    id: "dfw_storm",
    key: "[1]",
    name: "DFW Storm",
    severity: "high",
    severityLabel: "HIGH",
    description: "Arrival capacity reduced by 60% from 14:00 to 16:00.",
  },
  {
    id: "mechanical",
    key: "[2]",
    name: "Mechanical",
    severity: "medium",
    severityLabel: "MEDIUM",
    description: "Aircraft N104 grounded (AOG) at DFW from 12:30; afternoon rotation broken.",
  },
  {
    id: "late_inbound",
    key: "[3]",
    name: "Late Inbound",
    severity: "medium",
    severityLabel: "MEDIUM",
    description: "Aircraft N107 arrives 90 min late into the evening bank; connections at risk.",
  },
];

export function getScenarioMeta(id: string): ScenarioMeta {
  return SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
}

// Tailwind classes per severity for the alert panel.
export const SEVERITY_STYLES: Record<string, { box: string; text: string }> = {
  high: { box: "bg-red-500/10 border-red-500/30", text: "text-red-400" },
  medium: { box: "bg-amber-500/10 border-amber-500/30", text: "text-amber-400" },
  low: { box: "bg-emerald-500/10 border-emerald-500/30", text: "text-emerald-400" },
};
