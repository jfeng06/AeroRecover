import React from "react";
import { cn } from "@/lib/utils";

interface FlipBoardProps {
  value: string | number;
  label?: string;
  className?: string;
}

export function FlipBoard({ value, label, className }: FlipBoardProps) {
  const chars = String(value).split("");

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className="flex gap-0.5">
        {chars.map((char, idx) => (
          <div
            key={idx}
            className="relative flex items-center justify-center bg-[#1c1c1c] text-[#ff3333] font-mono text-4xl w-10 h-14 rounded-sm border-t border-[#333] shadow-inner"
            style={{ textShadow: "0px 0px 4px rgba(255, 51, 51, 0.4)" }}
          >
            {char}
            {/* Split line for the flip board look */}
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black opacity-50 shadow-[0_1px_1px_rgba(255,255,255,0.1)]" />
          </div>
        ))}
      </div>
      {label && <span className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">{label}</span>}
    </div>
  );
}
