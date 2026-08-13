"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import type { HistoryEntry } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function timeAgo(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

function buildHref(entry: HistoryEntry): string {
  const params = new URLSearchParams(entry.params);
  const qs = params.toString();
  return `/calculators/${entry.slug}${qs ? `?${qs}` : ""}`;
}

export function HistoryCard({ entry, onDelete }: { entry: HistoryEntry; onDelete: (id: string) => void }) {
  return (
    <Card className="p-4 flex items-center gap-3">
      <Link href={buildHref(entry)} className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-text truncate">{entry.title}</p>
        <p className="text-xs text-text-secondary truncate mt-0.5">{entry.summary}</p>
        <p className="text-[11px] text-text-muted mt-1">{timeAgo(entry.timestamp)}</p>
      </Link>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Delete history entry for ${entry.title}`}
        onClick={() => onDelete(entry.id)}
      >
        <Trash2 className="h-4 w-4 text-text-muted" />
      </Button>
    </Card>
  );
}
