"use client";

import React from "react";
import { useAppStore } from "@/lib/store";

export function ActionList() {
  const { optimizeData } = useAppStore();

  if (!optimizeData) {
    return null;
  }

  const { plan_id, actions } = optimizeData.selected_plan;

  return (
    <div className="flex flex-col gap-4 bg-zinc-950 p-6 rounded-lg border border-zinc-800">
      <h2 className="text-lg font-bold text-white uppercase tracking-wide">Recommended Plan #{plan_id}</h2>
      
      <div className="space-y-3">
        {actions.map((act, index) => (
          <div key={index} className="flex gap-4 items-start p-3 bg-zinc-900 rounded border border-zinc-800">
            <div className="bg-blue-500/20 text-blue-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              {index + 1}
            </div>
            <div>
              <p className="text-zinc-100 font-medium">{act}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
