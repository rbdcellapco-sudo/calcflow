"use client";

import { useEffect, useState } from "react";
import { History as HistoryIcon } from "lucide-react";
import { HistoryCard } from "./history-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { clearHistory, deleteHistoryEntry, getHistory } from "@/lib/storage";
import type { HistoryEntry } from "@/lib/types";

export function HistoryView() {
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);

  useEffect(() => {
    setHistory(getHistory());
    const onChange = () => setHistory(getHistory());
    window.addEventListener("calcflow:history-changed", onChange);
    return () => window.removeEventListener("calcflow:history-changed", onChange);
  }, []);

  if (history === null) return null;

  if (history.length === 0) {
    return (
      <EmptyState
        icon={HistoryIcon}
        title="No history yet"
        description="Every calculation you run gets saved here automatically, so you can reopen it later."
      />
    );
  }

  function handleClearAll() {
    const ok = window.confirm("Clear all history? This can't be undone.");
    if (ok) clearHistory();
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={handleClearAll}>
          Clear all
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {history.map((entry) => (
          <HistoryCard key={entry.id} entry={entry} onDelete={deleteHistoryEntry} />
        ))}
      </div>
    </div>
  );
}
