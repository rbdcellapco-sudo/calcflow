"use client";

import type { InputField } from "@/lib/types";
import { NumberInput } from "./inputs/number-input";
import { CurrencyInput } from "./inputs/currency-input";
import { PercentageInput } from "./inputs/percentage-input";
import { SelectInput } from "./inputs/select-input";
import { DateInput } from "./inputs/date-input";
import { SegmentedControl } from "./inputs/segmented-control";
import { Toggle } from "./inputs/toggle";
import { FieldWrapper, baseInputClasses, borderClasses } from "./inputs/field-wrapper";
import { cn } from "@/lib/cn";

export function CalculatorInput({
  field,
  value,
  onChange,
  error,
  currency,
  label,
}: {
  field: InputField;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  currency?: string;
  /** Overrides field.label - used for dynamicLabels */
  label?: string;
}) {
  const id = field.name;
  const resolvedLabel = label ?? field.label;

  switch (field.kind) {
    case "currency":
      return (
        <CurrencyInput
          id={id}
          label={resolvedLabel}
          value={value}
          onChange={onChange}
          error={error}
          helpText={field.helpText}
          currency={field.currency ?? currency}
          required={field.required}
        />
      );
    case "percentage":
      return (
        <PercentageInput
          id={id}
          label={resolvedLabel}
          value={value}
          onChange={onChange}
          error={error}
          helpText={field.helpText}
          required={field.required}
        />
      );
    case "select":
      return (
        <SelectInput
          id={id}
          label={resolvedLabel}
          value={value}
          onChange={onChange}
          options={field.options ?? []}
          error={error}
          helpText={field.helpText}
          required={field.required}
        />
      );
    case "segmented":
      return (
        <SegmentedControl
          id={id}
          label={resolvedLabel}
          value={value}
          onChange={onChange}
          options={field.options ?? []}
        />
      );
    case "toggle":
      return (
        <Toggle
          id={id}
          label={resolvedLabel}
          checked={value === "true"}
          onChange={(v) => onChange(v ? "true" : "false")}
          helpText={field.helpText}
        />
      );
    case "date":
      return (
        <DateInput
          id={id}
          label={resolvedLabel}
          value={value}
          onChange={onChange}
          error={error}
          helpText={field.helpText}
          required={field.required}
        />
      );
    case "text":
      return (
        <FieldWrapper id={id} label={resolvedLabel} helpText={field.helpText} error={error}>
          <input
            id={id}
            name={id}
            type="text"
            autoComplete="off"
            aria-invalid={Boolean(error)}
            className={cn(baseInputClasses, borderClasses(error))}
            value={value}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        </FieldWrapper>
      );
    case "number":
    default:
      return (
        <NumberInput
          id={id}
          label={resolvedLabel}
          value={value}
          onChange={onChange}
          error={error}
          helpText={field.helpText}
          unit={field.unit}
          required={field.required}
        />
      );
  }
}
