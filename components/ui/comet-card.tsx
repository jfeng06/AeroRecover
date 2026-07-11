import React from "react";
import { cn } from "@/lib/utils";

interface CometCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function CometCard({ children, className, title }: CometCardProps) {
  return (
    <div className={cn("relative bg-zinc-900 border-2 border-indigo-500 rounded-lg p-6", className)}>
      {/* Flat comet effect: a solid colored block on the top edge */}
      <div className="absolute top-0 left-0 w-32 h-1 bg-indigo-400" />
      {title && (
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-indigo-400 rounded-full" />
          <h3 className="text-lg font-bold text-white tracking-wide uppercase">{title}</h3>
        </div>
      )}
      <div className="text-zinc-300">
        {children}
      </div>
    </div>
  );
}
