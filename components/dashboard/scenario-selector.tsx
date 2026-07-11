"use client";

import React from "react";
import { Keyboard, Key } from "@/components/ui/keyboard";
import { useAppStore } from "@/lib/store";

export function ScenarioSelector() {
  const { selectedScenarioId, setSelectedScenarioId, runSimulation, isLoadingBaseline, baselineData } = useAppStore();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold uppercase tracking-wider text-zinc-100">Select Scenario</h2>
      </div>
      <Keyboard className="justify-start bg-zinc-950 border-zinc-800">
        <Key 
          active={selectedScenarioId === "dfw_storm"} 
          onClick={() => setSelectedScenarioId("dfw_storm")}
          className="w-auto px-4"
        >
          [1] DFW Storm
        </Key>
        <Key 
          active={selectedScenarioId === "mechanical"} 
          onClick={() => setSelectedScenarioId("mechanical")}
          className="w-auto px-4 opacity-50 cursor-not-allowed"
        >
          [2] Mechanical
        </Key>
        <Key 
          active={selectedScenarioId === "late_inbound"} 
          onClick={() => setSelectedScenarioId("late_inbound")}
          className="w-auto px-4 opacity-50 cursor-not-allowed"
        >
          [3] Late Inbound
        </Key>
      </Keyboard>
      
      {selectedScenarioId === "dfw_storm" && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-md">
          <p className="text-red-400 font-mono text-sm uppercase">Severity: HIGH</p>
          <p className="text-zinc-300 mt-2">Arrival capacity reduced by 60% from 14:00 to 16:00.</p>
        </div>
      )}

      <button
        onClick={runSimulation}
        disabled={isLoadingBaseline}
        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded uppercase tracking-wider disabled:opacity-50"
      >
        {isLoadingBaseline ? "Simulating..." : "Simulate Baseline"}
      </button>

    </div>
  );
}
