export interface Scenario {
  id: string;
  name: string;
  description: string;
  severity: "high" | "medium" | "low";
}

export interface Kpis {
  passenger_delay_minutes: number;
  missed_connections: number;
  cancellations: number;
  aircraft_out_of_position: number;
  recovery_score?: number;
}

export interface RecoveryPlan {
  plan_id: string;
  score: number;
  kpis: Kpis;
  actions: string[];
  manual_review_flags: string[];
}

export interface DeviceInfo {
  backend: string;
  device_type: string;
  device_name: string;
  torch_version: string;
  hip_version: string;
}

export interface RuntimeMetrics {
  candidate_count: number;
  runtime_ms: number;
  scenarios_per_second: number;
}

export interface OptimizeResponse {
  run_id: string;
  device: DeviceInfo;
  runtime: RuntimeMetrics;
  baseline_kpis: Kpis;
  top_plans: RecoveryPlan[];
  selected_plan: RecoveryPlan;
}

export interface GemmaBrief {
  recommended_plan: string;
  why: string;
  tradeoffs: string;
  controller_checklist: string[];
  passenger_service_message: string;
  executive_summary: string[];
}

export interface GemmaResponse {
  model: string;
  brief: GemmaBrief;
  trace: {
    latency_ms: number;
    prompt_version: string;
  };
}
