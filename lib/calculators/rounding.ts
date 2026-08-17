import { CircleDot } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";

const MODES = ["decimal-places", "significant-figures"] as const;

export const roundingSchema = z.object({
  mode: selectField(MODES, "Round by"),
  value: numberField({ label: "Value" }),
  digits: numberField({ label: "Digits", min: 0, max: 15, integer: true }),
});

export type RoundingValues = z.infer<typeof roundingSchema>;

function roundToSignificantFigures(value: number, sig: number): number {
  if (value === 0) return 0;
  const magnitude = Math.ceil(Math.log10(Math.abs(value)));
  const factor = Math.pow(10, sig - magnitude);
  return Math.round(value * factor) / factor;
}

function calculate(values: RoundingValues): CalcResult {
  const { mode, value, digits } = values;
  const rounded = mode === "decimal-places" ? Math.round(value * Math.pow(10, digits)) / Math.pow(10, digits) : roundToSignificantFigures(value, digits);

  return {
    primary: { key: "rounded", label: "Rounded value", value: rounded, format: "number" },
    secondary: [{ key: "original", label: "Original value", value, format: "number" }],
  };
}

export const roundingCalculator: CalculatorDef = {
  id: "rounding",
  slug: "rounding",
  title: "Rounding Calculator",
  description: "Round a number to a chosen number of decimal places or significant figures.",
  category: "math",
  icon: CircleDot,
  keywords: ["rounding", "decimal places", "significant figures", "sig figs"],
  inputs: [
    {
      name: "mode",
      label: "Round by",
      kind: "segmented",
      defaultValue: "decimal-places",
      options: [
        { value: "decimal-places", label: "Decimal places" },
        { value: "significant-figures", label: "Significant figures" },
      ],
    },
    { name: "value", label: "Value", kind: "number", defaultValue: "", required: true },
    { name: "digits", label: "Digits", kind: "number", defaultValue: "2", min: 0, max: 15, step: 1, required: true },
  ],
  schema: roundingSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  dynamicLabels: (values) => ({ digits: values.mode === "significant-figures" ? "Significant figures" : "Decimal places" }),
  formula: "Standard rounding (round-half-up) to the chosen number of decimal places or significant figures.",
  explanation: [
    {
      heading: "Decimal places vs. significant figures",
      body: "Decimal places count digits after the decimal point. Significant figures count all meaningful digits in a number — 0.00456 has 3 significant figures but 5 decimal places.",
    },
  ],
  faq: [
    { q: "Which should I use?", a: "Decimal places are common for currency and everyday numbers. Significant figures are more common in science, where they communicate measurement precision." },
  ],
  related: ["percent-error", "scientific-notation"],
};
