"use client";

import { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SearchBar from "@/components/SearchBar";
import WeatherBanner from "@/components/WeatherBanner";
import TrailCardList from "@/components/TrailCardList";
import IntentBadges from "@/components/IntentBadges";
import SkeletonCardList from "@/components/SkeletonCardList";
import ErrorMessage from "@/components/ErrorMessage";
import type { SearchResult } from "@/lib/types";

export default function Home() {
  const [query, setQuery] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const viewMode = loading || results || error ? "results" : "hero";

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, date }),
      });

      if (!res.ok) {
        throw new Error(`Search failed (${res.status})`);
      }

      const data: SearchResult = await res.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const resetToHero = () => {
    setResults(null);
    setLoading(false);
    setError(null);
    setQuery("");
  };

  return (
    <LayoutGroup>
      <Navbar onLogoClick={resetToHero} isTransparent={viewMode === "hero"} />

      <AnimatePresence mode="wait">
        {viewMode === "hero" ? (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <HeroSection>
              <motion.div layoutId="search-bar" className="w-full">
                <SearchBar
                  query={query}
                  date={date}
                  loading={loading}
                  onQueryChange={setQuery}
                  onDateChange={setDate}
                  onSubmit={handleSearch}
                />
              </motion.div>
            </HeroSection>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="pt-24 pb-12 mx-auto max-w-2xl px-4"
          >
            <motion.div layoutId="search-bar" className="mb-8 w-full">
              <SearchBar
                query={query}
                date={date}
                loading={loading}
                onQueryChange={setQuery}
                onDateChange={setDate}
                onSubmit={handleSearch}
              />
            </motion.div>

            {loading && <SkeletonCardList />}

            {error && <ErrorMessage message={error} onRetry={handleSearch} />}

            <AnimatePresence>
              {results && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="flex flex-col items-center gap-6"
                >
                  <IntentBadges intent={results.query_intent} />
                  <WeatherBanner weather={results.weather} />
                  <TrailCardList trails={results.trails} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}
