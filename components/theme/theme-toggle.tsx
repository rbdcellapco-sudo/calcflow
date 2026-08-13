"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "./theme-provider";
import { cn } from "@/lib/cn";
import type { ThemePreference } from "@/lib/types";

const OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn("flex rounded-[var(--radius-sm)] border border-border bg-surface-2 p-1 gap-1", compact ? "w-full" : "")}
    >
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const active = theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(opt.value)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 min-h-9 rounded-[calc(var(--radius-sm)-2px)] text-xs font-medium transition-colors duration-150",
              active ? "bg-accent text-accent-foreground" : "text-text-secondary hover:text-text"
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {!compact ? opt.label : null}
          </button>
        );
      })}
    </div>
  );
}
