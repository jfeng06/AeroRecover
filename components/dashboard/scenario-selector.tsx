"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, Plane } from "lucide-react";
import { Button } from "@/components/ui/neon-button";
import { useAppStore } from "@/lib/store";
import { SEVERITY_STYLES } from "@/lib/scenarios";

export function ScenarioSelector() {
  const {
    airports,
    selectedScenarioId,
    setSelectedScenarioId,
    runSimulation,
    isLoadingBaseline,
    baselineData,
  } = useAppStore();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selected = airports.find((a) => a.id === selectedScenarioId);
  const disruption = baselineData?.disruption;
  const severity = disruption ? SEVERITY_STYLES[disruption.severity] ?? SEVERITY_STYLES.high : null;

  // Close the dropdown on outside click.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = airports.filter(
      (a) => !q || a.code.toLowerCase().includes(q) || a.city.toLowerCase().includes(q)
    );
    return {
      US: filtered.filter((a) => a.region === "US"),
      Global: filtered.filter((a) => a.region === "Global"),
    };
  }, [airports, query]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold uppercase tracking-wider text-zinc-100">Select Airport</h2>
      </div>

      {/* Dropdown */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-zinc-600 transition-colors"
        >
          <span className="flex items-center gap-3 min-w-0">
            <Plane className="w-4 h-4 text-blue-400 shrink-0" />
            {selected ? (
              <span className="flex items-center gap-2 min-w-0">
                <span className="font-mono font-bold text-zinc-100">{selected.code}</span>
                <span className="text-zinc-400 truncate">{selected.city}</span>
              </span>
            ) : (
              <span className="text-zinc-500">Loading airports…</span>
            )}
          </span>
          <ChevronDown className={`w-4 h-4 text-zinc-500 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="absolute z-20 mt-2 w-full bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-800">
              <Search className="w-4 h-4 text-zinc-500" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search code or city…"
                className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
              />
            </div>
            <div className="max-h-72 overflow-y-auto">
              {(["US", "Global"] as const).map((region) =>
                groups[region].length ? (
                  <div key={region}>
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-600 bg-zinc-900/50 sticky top-0">
                      {region === "US" ? "United States" : "Global"}
                    </div>
                    {groups[region].map((a) => (
                      <button
                        key={a.id}
                        onClick={() => {
                          setSelectedScenarioId(a.id);
                          setOpen(false);
                          setQuery("");
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-zinc-800/60 transition-colors ${
                          a.id === selectedScenarioId ? "bg-blue-500/10" : ""
                        }`}
                      >
                        <span className="font-mono font-bold text-sm text-zinc-100 w-10">{a.code}</span>
                        <span className="text-sm text-zinc-400 truncate">{a.city}</span>
                      </button>
                    ))}
                  </div>
                ) : null
              )}
              {!groups.US.length && !groups.Global.length && (
                <div className="px-3 py-6 text-center text-sm text-zinc-600">No airports match “{query}”.</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Disruption panel: shows the live rolled disruption after a simulation,
          or a hint before one has been run. */}
      {disruption && severity ? (
        <div className={`${severity.box} border p-4 rounded-md`}>
          <div className="flex items-center justify-between">
            <p className={`${severity.text} font-mono text-sm uppercase`}>
              Severity: {disruption.severity}
            </p>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              {disruption.label}
            </span>
          </div>
          <p className="text-zinc-300 mt-2 min-h-[3rem]">{disruption.description}</p>
        </div>
      ) : (
        <div className="border border-zinc-800 bg-zinc-950 p-4 rounded-md">
          <p className="text-zinc-400 text-sm">
            {selected ? (
              <>
                <span className="font-mono font-bold text-zinc-200">{selected.code}</span> — run a
                simulation to roll a live disruption for {selected.city}.
              </>
            ) : (
              "Select an airport to begin."
            )}
          </p>
        </div>
      )}

      <Button
        onClick={runSimulation}
        disabled={isLoadingBaseline || !selectedScenarioId}
        variant="solid"
        size="lg"
        className="mt-2 w-full font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoadingBaseline ? "Simulating..." : "Simulate Baseline"}
      </Button>
    </div>
  );
}
