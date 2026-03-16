import type { TrailResult } from "@/lib/types";
import TrailCard from "./TrailCard";

interface TrailCardListProps {
  trails: TrailResult[];
}

export default function TrailCardList({ trails }: TrailCardListProps) {
  if (trails.length === 0) {
    return (
      <div className="w-full max-w-2xl rounded-lg border border-sage-200 bg-white p-8 text-center">
        <p className="text-sage-500">
          No trails found matching your criteria. Try broadening your search.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl space-y-4">
      {trails.map((trail) => (
        <TrailCard key={trail.trail_id} trail={trail} />
      ))}
    </div>
  );
}
