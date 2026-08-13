import type { CalculatorDef } from "@/lib/types";

export function CalculatorHeader({ def }: { def: CalculatorDef }) {
  const Icon = def.icon;
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-accent-soft text-accent">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-text flex items-center gap-2 flex-wrap">
          {def.title}
          {def.region ? (
            <span className="text-xs font-medium text-text-secondary bg-surface-2 border border-border rounded-full px-2 py-0.5">
              {def.region}
            </span>
          ) : null}
        </h1>
        <p className="text-sm text-text-secondary mt-0.5">{def.description}</p>
      </div>
    </div>
  );
}
