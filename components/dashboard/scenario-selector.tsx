"use client";

import React from "react";
import { Keyboard, Key } from "@/components/ui/keyboard";
import { Button } from "@/components/ui/neon-button";
import { useAppStore } from "@/lib/store";
import { SCENARIOS, getScenarioMeta, SEVERITY_STYLES } from "@/lib/scenarios";

export function ScenarioSelector() {
  const { selectedScenarioId, setSelectedScenarioId, runSimulation, isLoadingBaseline } = useAppStore();

  const active = getScenarioMeta(selectedScenarioId);
  const severity = SEVERITY_STYLES[active.severity] ?? SEVERITY_STYLES.high;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold uppercase tracking-wider text-zinc-100">Select Scenario</h2>
      </div>
      <Keyboard className="justify-start bg-zinc-950 border-zinc-800">
        {SCENARIOS.map((s) => (
          <Key
            key={s.id}
            active={selectedScenarioId === s.id}
            onClick={() => setSelectedScenarioId(s.id)}
            className="w-auto px-4"
          >
            {s.key} {s.name}
          </Key>
        ))}
      </Keyboard>

      <div className={`${severity.box} border p-4 rounded-md`}>
        <p className={`${severity.text} font-mono text-sm uppercase`}>Severity: {active.severityLabel}</p>
        {/* Reserve height for the longest (3-line) description so the panel
            height is constant across scenarios and the controls below it
            don't jump when switching. */}
        <p className="text-zinc-300 mt-2 min-h-[4.5rem]">{active.description}</p>
      </div>

      <Button
        onClick={runSimulation}
        disabled={isLoadingBaseline}
        variant="solid"
        size="lg"
        className="mt-4 w-full font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoadingBaseline ? "Simulating..." : "Simulate Baseline"}
      </Button>
    </div>
  );
}
