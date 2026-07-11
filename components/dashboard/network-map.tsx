import React from "react";
import { GlobeFlights } from "@/components/ui/cobe-globe-flights";

export function NetworkMap() {
  return (
    <div className="flex flex-col gap-4 bg-zinc-950 border border-zinc-800 p-6 rounded-lg h-full overflow-hidden">
      <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Network Impact</h3>
      <div className="flex-1 w-full min-h-[300px] flex items-center justify-center relative">
        <GlobeFlights className="w-full max-w-[400px] aspect-square" />
      </div>
      <div className="flex justify-between text-xs text-zinc-500 font-medium px-4 pt-2 border-t border-zinc-800/50">
        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /> Disrupted Hub (DFW)</span>
        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" /> Affected Flights</span>
      </div>
    </div>
  );
}
