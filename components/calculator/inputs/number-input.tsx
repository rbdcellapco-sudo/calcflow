"use client";

import { sanitizeNumericInput } from "@/lib/format";
import { FieldWrapper, baseInputClasses, borderClasses } from "./field-wrapper";
import { cn } from "@/lib/cn";

export function NumberInput({
  id,
  label,
  value,
  onChange,
  error,
  helpText,
  placeholder,
  unit,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  helpText?: string;
  placeholder?: string;
  unit?: string;
  required?: boolean;
}) {
  return (
    <FieldWrapper id={id} label={label} helpText={helpText} error={error}>
      <div className="relative">
        <input
          id={id}
          name={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          aria-required={required}
          aria-invalid={Boolean(error)}
          className={cn(baseInputClasses, borderClasses(error), unit ? "pr-12" : undefined)}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(sanitizeNumericInput(e.target.value))}
        />
        {unit ? (
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted text-sm">
            {unit}
          </span>
        ) : null}
      </div>
    </FieldWrapper>
  );
}
