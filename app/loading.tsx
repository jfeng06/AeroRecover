export default function Loading() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[#09090b] text-white">
      <div className="flex items-center gap-4">
        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-red-500"></div>
        <p className="text-sm font-bold uppercase tracking-widest text-zinc-400">Loading AMD OpsTwin...</p>
      </div>
    </div>
  );
}
