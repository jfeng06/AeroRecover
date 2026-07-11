import React from "react";
import { cn } from "@/lib/utils";

interface DotMatrixProps {
  lines: string[];
  className?: string;
}

export function DotMatrix({ lines, className }: DotMatrixProps) {
  return (
    <div className={cn("bg-[#0a0a0a] border border-[#1a1a1a] rounded p-4 font-mono text-sm leading-relaxed overflow-x-auto", className)}>
      {lines.map((line, idx) => (
        <div key={idx} className="flex">
          <span className="text-[#333] mr-4 select-none">{String(idx + 1).padStart(2, '0')}</span>
          <span className="text-[#00ffcc]">{line}</span>
        </div>
      ))}
    </div>
  );
}
