"use client";

import { FieldWrapper, baseInputClasses, borderClasses } from "./field-wrapper";
import { cn } from "@/lib/cn";

export function DateInput({
  id,
  label,
  value,
  onChange,
  error,
  helpText,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  helpText?: string;
  required?: boolean;
}) {
  return (
    <FieldWrapper id={id} label={label} helpText={helpText} error={error}>
      <input
        id={id}
        name={id}
        type="date"
        aria-required={required}
        aria-invalid={Boolean(error)}
        className={cn(baseInputClasses, borderClasses(error))}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldWrapper>
  );
}
