"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface HeroSectionProps {
  children: ReactNode;
}

export default function HeroSection({ children }: HeroSectionProps) {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center px-4"
      style={{
        backgroundImage: "url('/hero-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Bottom gradient fading into forest-900 */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-forest-900 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-2xl text-center">
        {/* Eyebrow badge */}
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-widest text-cream-100/70 uppercase backdrop-blur-sm">
          Hong Kong · AI Trail Finder
        </span>

        <h1 className="leading-none tracking-tight text-center" style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}>
          <span className="block text-5xl sm:text-6xl lg:text-7xl text-cream-50">
            Find your
          </span>
          <span
            className="block text-5xl sm:text-6xl lg:text-7xl text-sage-300"
            style={{ fontStyle: "italic" }}
          >
            perfect hike
          </span>
        </h1>

        <p className="text-lg text-cream-100/80">
          Describe what you are looking for in natural language
        </p>

        {/* Divider */}
        <div className="w-12 h-px bg-gold-400/60 mx-auto" />

        {children}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-50">
        <span className="text-xs text-cream-100 tracking-widest uppercase">Scroll</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
          <svg
            className="w-4 h-4 text-cream-100"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="4 6 8 10 12 6" />
          </svg>
        </motion.div>
      </div>
    </section>
  );
}
