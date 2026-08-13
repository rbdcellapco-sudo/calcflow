"use client";

import { groupThousands, sanitizeNumericInput } from "@/lib/format";
import { FieldWrapper, baseInputClasses, borderClasses } from "./field-wrapper";
import { cn } from "@/lib/cn";

const SYMBOLS: Record<string, string> = {
  USD: "$",
  INR: "₹",
  EUR: "€",
  GBP: "£",
  CAD: "$",
  AUD: "$",
};

export function CurrencyInput({
  id,
  label,
  value,
  onChange,
  error,
  helpText,
  placeholder = "0",
  currency = "USD",
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  helpText?: string;
  placeholder?: string;
  currency?: string;
  required?: boolean;
}) {
  const symbol = SYMBOLS[currency] ?? "$";
  const display = groupThousands(value);

  return (
    <FieldWrapper id={id} label={label} helpText={helpText} error={error}>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary text-[18px]">
          {symbol}
        </span>
        <input
          id={id}
          name={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          aria-required={required}
          aria-invalid={Boolean(error)}
          className={cn(baseInputClasses, borderClasses(error), "pl-8")}
          value={display}
          placeholder={placeholder}
          onChange={(e) => onChange(sanitizeNumericInput(e.target.value))}
        />
      </div>
    </FieldWrapper>
  );
}
