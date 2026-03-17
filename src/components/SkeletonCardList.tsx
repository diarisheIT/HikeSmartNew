"use client";

import { motion } from "framer-motion";
import SkeletonCard from "./SkeletonCard";

export default function SkeletonCardList() {
  return (
    <div className="w-full max-w-2xl space-y-4">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.3 }}
        >
          <SkeletonCard />
        </motion.div>
      ))}
    </div>
  );
}
