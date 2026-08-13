"use client";

import { useEffect, useState } from "react";
import { getHistory } from "@/lib/storage";
import { getCalculatorBySlug } from "@/lib/registry";
import { CalculatorCard } from "./calculator-card";
import type { HistoryEntry } from "@/lib/types";

export function RecentCalculators() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(getHistory());
    const onChange = () => setHistory(getHistory());
    window.addEventListener("calcflow:history-changed", onChange);
    return () => window.removeEventListener("calcflow:history-changed", onChange);
  }, []);

  const recentSlugs = Array.from(new Set(history.map((h) => h.slug))).slice(0, 3);
  if (recentSlugs.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-text-secondary">Recently used</h2>
      <div className="flex flex-col gap-2">
        {recentSlugs.map((slug) => {
          const def = getCalculatorBySlug(slug);
          if (!def) return null;
          return <CalculatorCard key={slug} def={def} />;
        })}
      </div>
    </section>
  );
}
