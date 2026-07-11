"use client";

import React from "react";
import { PartitionBar, PartitionLegend } from "@/components/ui/partition-bar";
import { useAppStore } from "@/lib/store";

export function KpiComparison() {
  const { baselineData, optimizeData } = useAppStore();

  if (!baselineData) {
    return (
      <div className="flex flex-col gap-6 bg-zinc-950 p-6 border border-zinc-800 rounded-lg min-h-[200px] items-center justify-center">
        <p className="text-zinc-500 uppercase tracking-widest text-sm font-bold">Awaiting Simulation...</p>
      </div>
    );
  }

  const baselineKpis = baselineData.baseline_kpis;
  const optimizedKpis = optimizeData?.selected_plan?.kpis;

  const baselineChartData = [
    { id: "delay", label: "Delay (m)", value: baselineKpis.passenger_delay_minutes, color: "#ef4444" },
    { id: "missed", label: "Missed Conn.", value: baselineKpis.missed_connections * 10, color: "#f97316" }, // Scaled for visual
    { id: "cancel", label: "Cancellations", value: baselineKpis.cancellations * 1000, color: "#b91c1c" }, // Scaled
    { id: "oops", label: "Out of pos.", value: baselineKpis.aircraft_out_of_position * 1000, color: "#7f1d1d" }, // Scaled
  ];

  const totalValue = baselineChartData.reduce((acc, curr) => acc + curr.value, 0);

  const optimizedChartData = optimizedKpis ? [
    { id: "delay", label: "Delay (m)", value: optimizedKpis.passenger_delay_minutes, color: "#3b82f6" },
    { id: "missed", label: "Missed Conn.", value: optimizedKpis.missed_connections * 10, color: "#0ea5e9" }, // Scaled
    { id: "cancel", label: "Cancellations", value: optimizedKpis.cancellations * 1000, color: "#1d4ed8" }, // Scaled
    { id: "oops", label: "Out of pos.", value: optimizedKpis.aircraft_out_of_position * 1000, color: "#1e3a8a" }, // Scaled
  ] : [];

  return (
    <div className="flex flex-col gap-6 bg-zinc-950 p-6 border border-zinc-800 rounded-lg">
      <div>
        <h3 className="text-zinc-400 uppercase tracking-widest text-xs font-bold mb-2">Baseline Impact</h3>
        <PartitionBar items={baselineChartData} totalValue={totalValue} />
      </div>
      
      {optimizeData && (
        <div>
          <h3 className="text-zinc-400 uppercase tracking-widest text-xs font-bold mb-2">Optimized Recovery (Plan #{optimizeData.selected_plan.plan_id})</h3>
          <PartitionBar items={optimizedChartData} totalValue={totalValue} />
        </div>
      )}

      <div className="pt-4 border-t border-zinc-800">
        <PartitionLegend items={[
          { id: "1", label: "Delay Minutes", value: 0, color: "#ef4444" },
          { id: "2", label: "Missed Connections", value: 0, color: "#f97316" },
          { id: "3", label: "Cancellations", value: 0, color: "#b91c1c" },
          { id: "4", label: "Aircraft Out of Position", value: 0, color: "#7f1d1d" },
        ]} />
      </div>
    </div>
  );
}
