"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search, X, Clock } from "lucide-react";
import { searchCalculators } from "@/lib/search";
import { addRecentSearch, getRecentSearches } from "@/lib/storage";
import { allCalculators } from "@/lib/registry";

export function SearchView() {
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRecent(getRecentSearches());
    inputRef.current?.focus();
  }, []);

  const results = useMemo(() => searchCalculators(query), [query]);

  function handleSelect(query: string) {
    addRecentSearch(query);
    setRecent(getRecentSearches());
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          inputMode="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search calculators, e.g. 'loan payment'"
          aria-label="Search calculators"
          className="w-full min-h-12 rounded-[var(--radius-md)] border border-border bg-surface pl-11 pr-10 text-[16px] text-text placeholder:text-text-muted focus-visible:outline-none focus:border-accent"
        />
        {query ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center text-text-muted hover:text-text"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {!query ? (
        <div className="flex flex-col gap-6">
          {recent.length > 0 ? (
            <section className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold text-text-secondary">Recent searches</h2>
              <div className="flex flex-wrap gap-2">
                {recent.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuery(q)}
                    className="flex items-center gap-1.5 min-h-9 rounded-full border border-border bg-surface px-3 text-sm text-text-secondary hover:border-accent/50"
                  >
                    <Clock className="h-3.5 w-3.5" aria-hidden />
                    {q}
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-text-secondary">Popular</h2>
            <ResultsList
              results={allCalculators.slice(0, 6).map((calculator) => ({ calculator, score: 0 }))}
              onSelect={handleSelect}
              query=""
            />
          </section>
        </div>
      ) : (
        <ResultsList results={results} onSelect={handleSelect} query={query} />
      )}
    </div>
  );
}

function ResultsList({
  results,
  onSelect,
  query,
}: {
  results: { calculator: (typeof allCalculators)[number] }[];
  onSelect: (q: string) => void;
  query: string;
}) {
  if (query && results.length === 0) {
    return <p className="text-sm text-text-secondary py-8 text-center">No calculators found for "{query}".</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {results.map(({ calculator }) => {
        const Icon = calculator.icon;
        return (
          <li key={calculator.slug}>
            <Link
              href={`/calculators/${calculator.slug}`}
              onClick={() => onSelect(query || calculator.title)}
              className="flex items-center gap-3 min-h-14 rounded-[var(--radius-md)] border border-border bg-surface px-3 hover:border-accent/50 transition-colors duration-150"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-accent-soft text-accent">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-text truncate">{calculator.title}</p>
                <p className="text-xs text-text-secondary truncate">{calculator.description}</p>
              </div>
              <span className="text-[11px] uppercase tracking-wide text-text-muted shrink-0">
                {calculator.category}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
