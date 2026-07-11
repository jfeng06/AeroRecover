"use client";

import React from "react";
import { CometCard } from "@/components/ui/comet-card";
import { useAppStore } from "@/lib/store";

export function GemmaBrief() {
  const { gemmaData, isLoadingGemma, baselineData, optimizeData } = useAppStore();

  if (isLoadingGemma) {
    return (
      <CometCard title="Gemma Control-Tower Brief">
        <div className="flex items-center justify-center p-8 text-zinc-500 font-bold uppercase tracking-widest text-sm">
          Generating Brief...
        </div>
      </CometCard>
    );
  }

  if (!gemmaData && baselineData && optimizeData) {
    // If it failed or didn't auto-trigger
    return (
      <CometCard title="Gemma Control-Tower Brief">
        <div className="flex items-center justify-center p-8 text-zinc-500 font-bold uppercase tracking-widest text-sm">
          Awaiting Generation
        </div>
      </CometCard>
    );
  }

  if (!gemmaData) return null;

  return (
    <CometCard title="Gemma Control-Tower Brief">
      <div className="space-y-4 text-sm leading-relaxed">
        <div>
          <p className="text-white font-semibold mb-1">Executive Summary</p>
          <div className="text-zinc-400 space-y-1">
            {gemmaData.brief.executive_summary.map((line, i) => (
              <p key={i}>• {line}</p>
            ))}
          </div>
        </div>

        <div>
          <p className="text-white font-semibold mb-1">Primary Tradeoff</p>
          <p className="text-zinc-400">
            {gemmaData.brief.tradeoffs}
          </p>
        </div>

        <div className="bg-red-500/10 border border-red-500/20 p-3 rounded text-red-200 mt-4">
          <p className="font-bold uppercase tracking-wider text-xs mb-1">Manual Review Required</p>
          <div className="space-y-1">
            {gemmaData.brief.controller_checklist.map((item, i) => (
              <p key={i}>- {item}</p>
            ))}
          </div>
        </div>
      </div>
    </CometCard>
  );
}
