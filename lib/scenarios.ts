// Presentation types + severity styles for the dashboard.
// The airport list itself is served by the backend (GET /api/scenarios).

export interface Airport {
  id: string;      // airport code, e.g. "ATL"
  code: string;
  city: string;
  region: "US" | "Global";
}

export type Severity = "high" | "medium" | "low";

export interface Disruption {
  type: string;
  label: string;
  severity: Severity;
  window: string;
  capacity_note: string;
  description: string;
}

// Tailwind classes per severity for the alert panel.
export const SEVERITY_STYLES: Record<string, { box: string; text: string }> = {
  high: { box: "bg-red-500/10 border-red-500/30", text: "text-red-400" },
  medium: { box: "bg-amber-500/10 border-amber-500/30", text: "text-amber-400" },
  low: { box: "bg-emerald-500/10 border-emerald-500/30", text: "text-emerald-400" },
};
