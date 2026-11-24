export default function Loading() {
  return (
    <div className="space-y-5 animate-pulse" aria-label="Memuat">
      <div className="h-10 w-2/3 rounded-2xl bg-white/5" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden border border-white/10">
            <div className="aspect-[3/4] bg-white/5" />
            <div className="p-3 space-y-2">
              <div className="h-4 w-4/5 rounded bg-white/5" />
              <div className="h-3 w-1/2 rounded bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
