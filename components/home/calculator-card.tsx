import Link from "next/link";
import type { CalculatorDef } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

export function CalculatorCard({ def }: { def: CalculatorDef }) {
  const Icon = def.icon;
  return (
    <Link href={`/calculators/${def.slug}`} className="block">
      <Card className="p-4 flex items-center gap-3 hover:border-accent/50 hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 transition-[border-color,box-shadow,transform] duration-150 min-h-11">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-accent-soft text-accent">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-text truncate">{def.title}</p>
          <p className="text-xs text-text-secondary line-clamp-1">{def.description}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-text-muted shrink-0" aria-hidden />
      </Card>
    </Link>
  );
}
