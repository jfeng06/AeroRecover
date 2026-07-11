import React from "react";
import { cn } from "@/lib/utils";

interface KeyboardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Keyboard({ className, children, ...props }: KeyboardProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 items-center justify-center p-4 bg-zinc-900 rounded-lg border border-zinc-800",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface KeyProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function Key({ className, children, active, ...props }: KeyProps) {
  return (
    <button
      className={cn(
        "relative flex h-12 w-12 items-center justify-center rounded-md border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500",
        active
          ? "border-blue-500 bg-blue-500/20 text-blue-400"
          : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
