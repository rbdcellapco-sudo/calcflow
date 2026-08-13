"use client";

import { formatResultValue } from "@/lib/format";
import type { ResultValue } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

export function ResultBreakdown({
  results,
  currency,
  locale,
}: {
  results: ResultValue[];
  currency: string;
  locale: string;
}) {
  if (results.length === 0) return null;
  return (
    <Card className="p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-text-secondary mb-3">Breakdown</h2>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
        {results.map((r) => (
          <div
            key={r.key}
            className={cn(
              "flex items-center justify-between gap-3 border-b border-border/70 pb-2 sm:border-none sm:pb-0",
              r.emphasis && "sm:col-span-2"
            )}
          >
            <dt className="text-sm text-text-secondary">{r.label}</dt>
            <dd className={cn("text-sm font-semibold text-text text-right", r.emphasis && "text-base text-accent")}>
              {formatResultValue(r, currency, locale)}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
