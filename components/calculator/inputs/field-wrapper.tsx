import * as React from "react";
import { cn } from "@/lib/cn";

export function FieldWrapper({
  id,
  label,
  helpText,
  error,
  children,
  className,
}: {
  id: string;
  label: string;
  helpText?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-text">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : helpText ? (
        <p className="text-sm text-text-muted">{helpText}</p>
      ) : null}
    </div>
  );
}

export const baseInputClasses =
  "w-full min-h-11 rounded-[var(--radius-sm)] border bg-surface px-3.5 text-[18px] text-text placeholder:text-text-muted focus-visible:outline-none transition-colors";

export function borderClasses(hasError?: string) {
  return hasError ? "border-danger" : "border-border focus:border-accent";
}
