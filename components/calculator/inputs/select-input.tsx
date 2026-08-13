"use client";

import type { SelectOption } from "@/lib/types";
import { FieldWrapper, baseInputClasses, borderClasses } from "./field-wrapper";
import { cn } from "@/lib/cn";

export function SelectInput({
  id,
  label,
  value,
  onChange,
  options,
  error,
  helpText,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  error?: string;
  helpText?: string;
  required?: boolean;
}) {
  return (
    <FieldWrapper id={id} label={label} helpText={helpText} error={error}>
      <select
        id={id}
        name={id}
        aria-required={required}
        aria-invalid={Boolean(error)}
        className={cn(baseInputClasses, borderClasses(error), "text-[16px]")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}
