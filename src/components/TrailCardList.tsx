"use client";

import { motion } from "framer-motion";
import type { TrailResult } from "@/lib/types";
import TrailCard from "./TrailCard";

interface TrailCardListProps {
  trails: TrailResult[];
}

export default function TrailCardList({ trails }: TrailCardListProps) {
  if (trails.length === 0) {
    return (
      <div className="w-full max-w-2xl rounded-lg border border-forest-700 bg-forest-800 p-8 text-center">
        <p className="text-cream-100/60">
          No trails found matching your criteria. Try broadening your search.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl space-y-4">
      {trails.map((trail, index) => (
        <motion.div
          key={trail.trail_id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.12, duration: 0.4 }}
        >
          <TrailCard trail={trail} />
        </motion.div>
      ))}
    </div>
  );
}
