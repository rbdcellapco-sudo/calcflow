"use client";

import type { SelectOption } from "@/lib/types";
import { cn } from "@/lib/cn";

export function SegmentedControl({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span id={`${id}-label`} className="text-sm font-medium text-text">
        {label}
      </span>
      <div
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        className="flex w-full rounded-[var(--radius-sm)] border border-border bg-surface-2 p-1 gap-1"
      >
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(opt.value)}
              className={cn(
                "flex-1 min-h-9 rounded-[calc(var(--radius-sm)-2px)] px-2 text-sm font-medium transition-colors duration-150",
                active
                  ? "bg-accent text-accent-foreground shadow-[var(--shadow-sm)]"
                  : "text-text-secondary hover:text-text"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
