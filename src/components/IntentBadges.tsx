import type { Intent } from "@/lib/types";

interface IntentBadgesProps {
  intent: Intent;
}

export default function IntentBadges({ intent }: IntentBadgesProps) {
  const badges: { label: string; value: string }[] = [];

  if (intent.location) badges.push({ label: "Location", value: intent.location });
  if (intent.difficulty) badges.push({ label: "Difficulty", value: intent.difficulty });
  if (intent.max_length) badges.push({ label: "Max Length", value: `${intent.max_length} km` });
  if (intent.terrain_type) badges.push({ label: "Terrain", value: intent.terrain_type });

  if (badges.length === 0) return null;

  return (
    <div className="flex w-full max-w-2xl flex-wrap gap-2">
      {badges.map((badge) => (
        <span
          key={badge.label}
          className="rounded-full bg-white/10 border border-white/15 backdrop-blur-md px-3 py-1 text-sm text-sage-300"
        >
          <span className="font-medium">{badge.label}:</span> {badge.value}
        </span>
      ))}
    </div>
  );
}
