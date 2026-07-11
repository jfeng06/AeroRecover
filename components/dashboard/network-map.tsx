import React from "react";

export function NetworkMap() {
  return (
    <div className="flex flex-col gap-4 bg-zinc-950 border border-zinc-800 p-6 rounded-lg h-full">
      <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Network Impact</h3>
      <div className="flex-1 min-h-[200px] flex items-center justify-center relative">
        {/* Simple static network visualization */}
        <div className="absolute w-full h-full flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-zinc-900 border-2 border-red-500 flex items-center justify-center z-10 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
            <span className="text-white font-bold text-sm">DFW</span>
          </div>
          
          {/* Spoke lines */}
          <div className="absolute top-1/2 left-1/4 w-1/4 h-[1px] bg-red-500/50 -rotate-12" />
          <div className="absolute top-1/2 left-[10%] w-[40%] h-[1px] bg-red-500/30 rotate-12" />
          <div className="absolute top-1/2 right-1/4 w-1/4 h-[1px] bg-blue-500/50 rotate-45" />
          <div className="absolute top-1/4 right-1/3 w-1/4 h-[1px] bg-red-500/40 -rotate-45" />
          <div className="absolute top-3/4 right-1/3 w-1/4 h-[1px] bg-zinc-700/50 -rotate-12" />
          
          {/* Spoke nodes */}
          <div className="absolute top-[35%] left-[20%] w-6 h-6 rounded-full bg-zinc-800 border border-red-500/50 flex items-center justify-center">
            <span className="text-zinc-400 text-[8px]">LAX</span>
          </div>
          <div className="absolute top-[60%] left-[8%] w-6 h-6 rounded-full bg-zinc-800 border border-red-500/50 flex items-center justify-center">
            <span className="text-zinc-400 text-[8px]">SEA</span>
          </div>
          <div className="absolute bottom-[20%] right-[20%] w-6 h-6 rounded-full bg-zinc-800 border border-blue-500/50 flex items-center justify-center">
            <span className="text-zinc-400 text-[8px]">MIA</span>
          </div>
          <div className="absolute top-[15%] right-[25%] w-6 h-6 rounded-full bg-zinc-800 border border-red-500/50 flex items-center justify-center">
            <span className="text-zinc-400 text-[8px]">DEN</span>
          </div>
        </div>
      </div>
      <div className="flex justify-between text-xs text-zinc-500 font-medium px-4">
        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /> Disrupted</span>
        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" /> Protected</span>
      </div>
    </div>
  );
}
