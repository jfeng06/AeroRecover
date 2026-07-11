"use client";

import React, { useEffect, useState } from "react";
import { FlipBoard } from "@/components/ui/flip-board";

function formatLocalHHMM(date: Date): string {
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}${mm}`;
}

export function Header() {
  // Placeholder until mounted so server and client render the same markup
  // (avoids a hydration mismatch); the real local time fills in on the client.
  const [time, setTime] = useState<string>("----");

  useEffect(() => {
    const update = () => setTime(formatLocalHHMM(new Date()));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex items-center justify-between py-6 px-8 border-b border-zinc-800 bg-zinc-950">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">AeroRecover</h1>
        <p className="text-sm font-medium text-zinc-500 mt-1">AMD OpsTwin for Airline Disruption Recovery</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-1">Current Time</p>
          <FlipBoard value={time} />
        </div>
      </div>
    </header>
  );
}
