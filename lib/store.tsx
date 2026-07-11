"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Scenario, OptimizeResponse, GemmaResponse } from "./types";

interface BaselineResponse {
  run_id: string;
  scenario_id?: string;
  baseline_kpis: any;
  affected_flights: any[];
  timeline: any[];
}

interface AppState {
  selectedScenarioId: string;
  baselineData: BaselineResponse | null;
  optimizeData: OptimizeResponse | null;
  gemmaData: GemmaResponse | null;
  isLoadingBaseline: boolean;
  isLoadingOptimize: boolean;
  isLoadingGemma: boolean;
}

interface AppContextType extends AppState {
  setSelectedScenarioId: (id: string) => void;
  runSimulation: () => Promise<void>;
  runOptimization: () => Promise<void>;
  generateBrief: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedScenarioId, setSelectedScenarioIdState] = useState("dfw_storm");
  const [baselineData, setBaselineData] = useState<BaselineResponse | null>(null);
  const [optimizeData, setOptimizeData] = useState<OptimizeResponse | null>(null);
  const [gemmaData, setGemmaData] = useState<GemmaResponse | null>(null);

  const [isLoadingBaseline, setIsLoadingBaseline] = useState(false);
  const [isLoadingOptimize, setIsLoadingOptimize] = useState(false);
  const [isLoadingGemma, setIsLoadingGemma] = useState(false);

  // Switching scenarios must clear stale results, otherwise the dashboard
  // keeps showing the previous scenario's data (the "every page looks the
  // same" bug started here on the frontend).
  const setSelectedScenarioId = (id: string) => {
    if (id === selectedScenarioId) return;
    setSelectedScenarioIdState(id);
    setBaselineData(null);
    setOptimizeData(null);
    setGemmaData(null);
  };

  const runSimulation = async () => {
    setIsLoadingBaseline(true);
    setOptimizeData(null);
    setGemmaData(null);
    try {
      const res = await fetch("/api/simulate/baseline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario_id: selectedScenarioId, seed: 42 }),
      });
      const data = await res.json();
      setBaselineData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingBaseline(false);
    }
  };

  const runOptimization = async () => {
    if (!baselineData) return;
    setIsLoadingOptimize(true);
    try {
      const res = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario_id: selectedScenarioId, candidate_count: 5000, seed: 42 }),
      });
      const data: OptimizeResponse = await res.json();
      setOptimizeData(data);
      // Auto-trigger the Gemma brief with the freshly-optimized plan.
      await generateBrief(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingOptimize(false);
    }
  };

  const generateBrief = async (optimize?: OptimizeResponse) => {
    setIsLoadingGemma(true);
    try {
      const opt = optimize ?? optimizeData ?? undefined;
      const res = await fetch("/api/gemma/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          run_id: opt?.run_id ?? baselineData?.run_id ?? `run_${selectedScenarioId}`,
          scenario_id: selectedScenarioId,
          baseline_kpis: opt?.baseline_kpis ?? baselineData?.baseline_kpis,
          top_plans: opt?.selected_plan ? [opt.selected_plan] : undefined,
        }),
      });
      const data = await res.json();
      setGemmaData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingGemma(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        selectedScenarioId,
        baselineData,
        optimizeData,
        gemmaData,
        isLoadingBaseline,
        isLoadingOptimize,
        isLoadingGemma,
        setSelectedScenarioId,
        runSimulation,
        runOptimization,
        generateBrief: () => generateBrief(),
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppStore must be used within an AppProvider");
  }
  return context;
}
