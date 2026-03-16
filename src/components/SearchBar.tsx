"use client";

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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="e.g. easy hikes near Sai Kung with sea views"
          className="flex-1 rounded-lg border border-sage-200 bg-white px-4 py-3 text-sage-900 placeholder-sage-400 shadow-sm transition-all duration-200 focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-200"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="rounded-lg border border-sage-200 bg-white px-4 py-3 text-sage-900 shadow-sm transition-all duration-200 focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-200"
        />
      </div>
      <button
        type="submit"
        disabled={loading || !query.trim()}
        className="w-full rounded-lg bg-sage-600 px-6 py-3 font-medium text-white shadow-sm transition-all duration-200 hover:bg-sage-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {loading ? "Searching..." : "Find Trails"}
      </button>
    </form>
  );
}
