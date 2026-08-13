"use client";

import { cn } from "@/lib/cn";

export function Toggle({
  id,
  label,
  checked,
  onChange,
  helpText,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  helpText?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div>
        <label htmlFor={id} className="text-sm font-medium text-text">
          {label}
        </label>
        {helpText ? <p className="text-sm text-text-muted">{helpText}</p> : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-150",
          checked ? "bg-accent" : "bg-surface-2 border border-border"
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-150",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    </div>
  );
}
