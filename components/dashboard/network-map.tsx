"use client";

import React, { useMemo } from "react";
import { GlobeFlights } from "@/components/ui/cobe-globe-flights";
import { useAppStore } from "@/lib/store";

export function NetworkMap() {
  const { airports } = useAppStore();

  const { markers, arcs, hubCode } = useMemo(() => {
    const hub = airports.find((a) => a.code === "ATL") ?? airports[0];

    const markers = airports.map((a) => ({
      id: `apt-${a.code}`,
      location: [a.lat, a.lon] as [number, number],
      // Keep ATL visually dominant as the network hub.
      size: a.id === hub?.id ? 0.09 : 0.045,
    }));

    // Connect the ATL hub to every other airport in the registry.
    const others = airports.filter((a) => a.id !== hub?.id);
    const arcs = hub
      ? others
          .map((a) => ({
            id: `arc-${hub.code}-${a.code}`,
            from: [hub.lat, hub.lon] as [number, number],
            to: [a.lat, a.lon] as [number, number],
          }))
      : [];

    return { markers, arcs, hubCode: hub?.code };
  }, [airports]);

  return (
    <div className="flex flex-col gap-4 bg-zinc-950 border border-zinc-800 p-6 rounded-lg h-full overflow-hidden">
      <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Network Impact</h3>
      <div className="flex-1 w-full min-h-[440px] px-3 sm:px-8 flex items-center justify-center relative">
        <GlobeFlights
          className="w-full max-w-[520px] aspect-square"
          markers={markers.length ? markers : undefined}
          arcs={arcs.length ? arcs : undefined}
        />
      </div>
      <div className="flex justify-between text-xs text-zinc-500 font-medium px-4 pt-2 border-t border-zinc-800/50">
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500" /> Airports ({airports.length})
        </span>
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-500" /> Routes from {hubCode ?? "—"}
        </span>
      </div>
    </div>
  );
}
