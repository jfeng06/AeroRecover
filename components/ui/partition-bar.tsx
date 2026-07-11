import React from "react";
import { cn } from "@/lib/utils";

export interface PartitionItem {
  id: string;
  label: string;
  value: number;
  color: string;
}

interface PartitionBarProps {
  items: PartitionItem[];
  className?: string;
  totalValue?: number;
}

export function PartitionBar({ items, className, totalValue }: PartitionBarProps) {
  const total = totalValue || items.reduce((acc, item) => acc + item.value, 0);

  if (total === 0) return null;

  return (
    <div className={cn("flex w-full h-8 overflow-hidden rounded-md bg-zinc-800", className)}>
      {items.map((item) => {
        const percentage = (item.value / total) * 100;
        if (percentage === 0) return null;

        return (
          <div
            key={item.id}
            style={{
              width: `${percentage}%`,
              backgroundColor: item.color,
            }}
            className="flex h-full items-center justify-center transition-all duration-500 ease-in-out"
            title={`${item.label}: ${item.value} (${percentage.toFixed(1)}%)`}
          >
            {percentage > 10 && (
              <span className="text-xs font-semibold text-white px-1 truncate">
                {item.value}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function PartitionLegend({ items, className }: { items: PartitionItem[], className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-4 text-sm mt-2", className)}>
      {items.map(item => (
        <div key={item.id} className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
          <span className="text-zinc-400 font-medium">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
