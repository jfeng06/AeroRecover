"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-[#09090b] text-white">
      <h2 className="text-xl font-bold uppercase tracking-widest text-red-500">Something went wrong!</h2>
      <p className="text-zinc-400 font-mono text-sm max-w-lg text-center">
        {error.message || "An unexpected error occurred in the AMD OpsTwin simulation engine."}
      </p>
      <button
        onClick={() => reset()}
        className="mt-4 rounded bg-red-600 px-4 py-2 text-sm font-bold uppercase tracking-wider text-white hover:bg-red-500 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
