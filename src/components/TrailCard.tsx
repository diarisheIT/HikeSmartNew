import type { TrailResult } from "@/lib/types";

interface TrailCardProps {
  trail: TrailResult;
}

const difficultyColors: Record<string, string> = {
  Easy: "bg-green-100 text-green-800",
  Moderate: "bg-amber-100 text-amber-800",
  Difficult: "bg-red-100 text-red-800",
  Demanding: "bg-red-200 text-red-900",
  "Very difficult": "bg-red-300 text-red-950",
};

export default function TrailCard({ trail }: TrailCardProps) {
  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(
    trail.name_en + " Hong Kong"
  )}`;

  return (
    <div className="rounded-xl border border-white/10 bg-white/10 backdrop-blur-xl p-5 transition-all duration-200 hover:bg-white/15 hover:border-white/20 hover:shadow-lg hover:shadow-black/30">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-cream-50">{trail.name_en}</h3>
          {trail.name_ch && (
            <p className="text-sm text-cream-100/60">{trail.name_ch}</p>
          )}
        </div>
        {trail.difficulty && (
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
              difficultyColors[trail.difficulty] ?? "bg-forest-700 text-cream-100"
            }`}
          >
            {trail.difficulty}
          </span>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-cream-100/70">
        {trail.length_km != null && <span>{trail.length_km} km</span>}
        {trail.region_en && <span>{trail.region_en}</span>}
        {trail.trail_type_en && <span>{trail.trail_type_en}</span>}
        {trail.distance_km != null && (
          <span>{trail.distance_km} km away</span>
        )}
      </div>

      {(trail.start_point_en || trail.finish_point_en) && (
        <div className="mb-4 text-sm text-cream-100/50">
          {trail.start_point_en && <span>From: {trail.start_point_en}</span>}
          {trail.start_point_en && trail.finish_point_en && <span> | </span>}
          {trail.finish_point_en && <span>To: {trail.finish_point_en}</span>}
        </div>
      )}

      <div className="flex gap-3">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md bg-sage-500/30 px-4 py-2 text-sm font-medium text-cream-100 transition-all duration-200 hover:bg-sage-400/40"
        >
          View Location
        </a>
        {trail.official_url && (
          <a
            href={trail.official_url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-sage-500/40 px-4 py-2 text-sm font-medium text-cream-100/70 transition-all duration-200 hover:bg-sage-500/20"
          >
            Official Website
          </a>
        )}
      </div>
    </div>
  );
}
