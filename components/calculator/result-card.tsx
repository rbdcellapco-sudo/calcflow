"use client";

import { formatResultValue } from "@/lib/format";
import type { ResultValue } from "@/lib/types";
import { Card } from "@/components/ui/card";

export function ResultCard({
  result,
  currency,
  locale,
}: {
  result: ResultValue;
  currency: string;
  locale: string;
}) {
  return (
    <Card className="border-accent/30 bg-accent-soft p-6 sm:p-8 text-center" role="status" aria-live="polite">
      <p className="text-sm font-medium text-text-secondary mb-2">{result.label}</p>
      <p className="text-4xl sm:text-5xl font-bold text-text tracking-tight transition-all duration-200">
        {formatResultValue(result, currency, locale)}
      </p>
    </Card>
  );
}
