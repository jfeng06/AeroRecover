"use client";

import React from "react";
import { DotMatrix } from "@/components/ui/dot-matrix";
import { Button } from "@/components/ui/neon-button";
import { useAppStore } from "@/lib/store";

export function AmdCompute() {
  const { baselineData, optimizeData, runOptimization, isLoadingOptimize } = useAppStore();

  const terminalLines = optimizeData ? [
    "INIT AMD Scenario Engine v2.4.1",
    `TARGET: ROCm / AMD Instinct`,
    `DEVICE: ${optimizeData.device.device_name}`,
    "STATUS: ONLINE",
    "> Generating candidates...",
    `Candidates generated: ${optimizeData.runtime.candidate_count}`,
    "> Vectorizing PyTorch tensors...",
    `Scoring runtime: ${optimizeData.runtime.runtime_ms}ms`,
    `Scenarios/sec: ${optimizeData.runtime.scenarios_per_second}`,
    "> Returning top-k plans..."
  ] : [
    "INIT AMD Scenario Engine v2.4.1",
    "TARGET: ROCm / AMD Instinct",
    "STATUS: STANDBY",
    "Awaiting baseline simulation..."
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-end border-b border-zinc-800 pb-2">
        <h2 className="text-xl font-bold uppercase tracking-wider text-zinc-100">AMD Scenario Engine</h2>
        {baselineData && !optimizeData && (
          <Button
            onClick={runOptimization}
            disabled={isLoadingOptimize}
            variant="solid"
            size="sm"
            className="shrink-0 whitespace-nowrap font-bold uppercase tracking-wider text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingOptimize ? "Optimizing..." : "Optimize on AMD"}
          </Button>
        )}
      </div>
      <DotMatrix lines={terminalLines} />
      
      {optimizeData && (
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
            <p className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest">Device</p>
            <p className="text-zinc-100 font-mono text-sm mt-1">{optimizeData.device.device_name}</p>
          </div>
          <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
            <p className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest">Scenarios / Sec</p>
            <p className="text-zinc-100 font-mono text-sm mt-1 text-[#00ffcc]">{optimizeData.runtime.scenarios_per_second.toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}
