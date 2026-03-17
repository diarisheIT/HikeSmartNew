"use client";

import { useTypewriter } from "@/hooks/useTypewriter";

interface SearchBarProps {
  query: string;
  date: string;
  loading: boolean;
  onQueryChange: (query: string) => void;
  onDateChange: (date: string) => void;
  onSubmit: () => void;
}

export default function SearchBar({
  query,
  date,
  loading,
  onQueryChange,
  onDateChange,
  onSubmit,
}: SearchBarProps) {
  const typewriterText = useTypewriter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative w-full max-w-2xl space-y-4 ${loading ? "shimmer-border" : ""}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-cream-50 backdrop-blur-sm transition-all duration-200 focus:border-sage-400/60 focus:outline-none focus:ring-2 focus:ring-sage-400/25"
          />
          {!query && (
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cream-50/50">
              {typewriterText}
              <span className="ml-px inline-block w-px h-5 bg-cream-50/50 align-middle animate-pulse" />
            </span>
          )}
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-cream-50 backdrop-blur-sm transition-all duration-200 focus:border-sage-400/60 focus:outline-none focus:ring-2 focus:ring-sage-400/25"
        />
      </div>
      <button
        type="submit"
        disabled={loading || !query.trim()}
        className="w-full rounded-lg bg-sage-500 px-6 py-3 font-medium text-cream-50 shadow-sm transition-all duration-200 hover:bg-sage-400 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-cream-50/30 border-t-cream-50" />
            Searching...
          </span>
        ) : (
          "Find Trails"
        )}
      </button>
    </form>
  );
}
