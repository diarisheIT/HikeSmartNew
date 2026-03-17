export default function SkeletonCard() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/10 backdrop-blur-xl p-5 space-y-4">
      {/* Title + badge row */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-2 flex-1">
          <div className="h-5 w-3/5 rounded bg-white/15 animate-pulse" />
          <div className="h-4 w-2/5 rounded bg-white/10 animate-pulse" />
        </div>
        <div className="h-6 w-16 rounded-full bg-white/15 animate-pulse shrink-0" />
      </div>

      {/* Metadata row */}
      <div className="flex gap-4">
        <div className="h-4 w-16 rounded bg-white/10 animate-pulse" />
        <div className="h-4 w-24 rounded bg-white/10 animate-pulse" />
        <div className="h-4 w-20 rounded bg-white/10 animate-pulse" />
      </div>

      {/* Start/finish row */}
      <div className="h-4 w-4/5 rounded bg-white/10 animate-pulse" />

      {/* Buttons row */}
      <div className="flex gap-3">
        <div className="h-9 w-28 rounded-md bg-white/15 animate-pulse" />
        <div className="h-9 w-32 rounded-md bg-white/15 animate-pulse" />
      </div>
    </div>
  );
}
