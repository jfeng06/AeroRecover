import React from "react";
import { FlipBoard } from "@/components/ui/flip-board";

export function Header() {
  return (
    <header className="flex items-center justify-between py-6 px-8 border-b border-zinc-800 bg-zinc-950">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">AeroRecover</h1>
        <p className="text-sm font-medium text-zinc-500 mt-1">AMD OpsTwin for Airline Disruption Recovery</p>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-1">Current Time</p>
          <FlipBoard value="1420" />
        </div>
      </div>
    </header>
  );
}
