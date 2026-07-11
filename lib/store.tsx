"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { OptimizeResponse, GemmaResponse } from "./types";
import { Airport, Disruption } from "./scenarios";

interface BaselineResponse {
  run_id: string;
  scenario_id?: string;
  airport?: Airport;
  disruption?: Disruption;
  baseline_kpis: any;
  affected_flights: any[];
  timeline: any[];
}

interface AppState {
  airports: Airport[];
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
  const [airports, setAirports] = useState<Airport[]>([]);
  const [selectedScenarioId, setSelectedScenarioIdState] = useState("");
  const [baselineData, setBaselineData] = useState<BaselineResponse | null>(null);
  const [optimizeData, setOptimizeData] = useState<OptimizeResponse | null>(null);
  const [gemmaData, setGemmaData] = useState<GemmaResponse | null>(null);

  const [isLoadingBaseline, setIsLoadingBaseline] = useState(false);
  const [isLoadingOptimize, setIsLoadingOptimize] = useState(false);
  const [isLoadingGemma, setIsLoadingGemma] = useState(false);

  // Load the airport list (one scenario per airport) and default to the first.
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/scenarios");
        const data: Airport[] = await res.json();
        setAirports(data);
        if (data.length) setSelectedScenarioIdState((prev) => prev || data[0].id);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // Switching airport clears stale results so the dashboard never shows the
  // previous run's data.
  const setSelectedScenarioId = (id: string) => {
    if (id === selectedScenarioId) return;
    setSelectedScenarioIdState(id);
    setBaselineData(null);
    setOptimizeData(null);
    setGemmaData(null);
  };

  const runSimulation = async () => {
    if (!selectedScenarioId) return;
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
        body: JSON.stringify({
          scenario_id: selectedScenarioId,
          run_id: baselineData.run_id,
          candidate_count: 5000,
          seed: 42,
        }),
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
          run_id: opt?.run_id ?? baselineData?.run_id ?? "",
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
        airports,
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
