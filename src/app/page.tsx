"use client";

import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import WeatherBanner from "@/components/WeatherBanner";
import TrailCardList from "@/components/TrailCardList";
import IntentBadges from "@/components/IntentBadges";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import type { SearchResult } from "@/lib/types";

export default function Home() {
  const [query, setQuery] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-bold text-sage-800">
          Find Your Perfect Hike
        </h2>
        <p className="mt-2 text-sage-500">
          Describe what you're looking for in natural language
        </p>
      </div>

      <SearchBar
        query={query}
        date={date}
        loading={loading}
        onQueryChange={setQuery}
        onDateChange={setDate}
        onSubmit={handleSearch}
      />

      {loading && <LoadingSpinner />}

      {error && <ErrorMessage message={error} onRetry={handleSearch} />}

      {results && (
        <>
          <IntentBadges intent={results.query_intent} />
          <WeatherBanner weather={results.weather} />
          <TrailCardList trails={results.trails} />
        </>
      )}
    </div>
  );
}
