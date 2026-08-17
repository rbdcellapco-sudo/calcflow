import { GitCompare } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";

export const ratioSchema = z.object({
  a: numberField({ label: "A", min: 0.0000001 }),
  b: numberField({ label: "B", min: 0.0000001 }),
  c: numberField({ label: "C (solve for D)", min: 0, required: false }),
});

export type RatioValues = z.infer<typeof ratioSchema>;

function gcd(a: number, b: number): number {
  while (b) [a, b] = [b, a % b];
  return a;
}

function calculate(values: RatioValues): CalcResult {
  const { a, b, c } = values;
  // Simplify using GCD on scaled integers to handle decimals reasonably.
  const scale = 1e6;
  const intA = Math.round(a * scale);
  const intB = Math.round(b * scale);
  const divisor = gcd(intA, intB) || 1;
  const simplifiedA = intA / divisor;
  const simplifiedB = intB / divisor;

  const secondary = [
    { key: "decimal", label: "As a decimal", value: Math.round((a / b) * 1e8) / 1e8, format: "number" as const },
  ];

  if (c !== undefined && c > 0) {
    const d = (b * c) / a;
    secondary.push({ key: "d", label: "D (proportional value)", value: Math.round(d * 1e6) / 1e6, format: "number" as const });
  }

  return {
    primary: { key: "simplified", label: "Simplified ratio", value: `${simplifiedA}:${simplifiedB}`, format: "text" },
    secondary,
  };
}

export const ratioCalculator: CalculatorDef = {
  id: "ratio",
  slug: "ratio",
  title: "Ratio Calculator",
  description: "Simplify a ratio to lowest terms, or solve a proportion (A:B = C:D).",
  category: "math",
  icon: GitCompare,
  keywords: ["ratio", "simplify ratio", "proportion", "a is to b as c is to d"],
  inputs: [
    { name: "a", label: "A", kind: "number", defaultValue: "", step: 0.01, required: true },
    { name: "b", label: "B", kind: "number", defaultValue: "", step: 0.01, required: true },
  ],
  advancedInputs: [
    { name: "c", label: "C (optional, to solve A:B = C:D)", kind: "number", defaultValue: "", step: 0.01, required: false },
  ],
  schema: ratioSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Simplified ratio divides both terms by their greatest common divisor. Proportion: A:B = C:D → D = (B×C) ÷ A.",
  explanation: [
    {
      heading: "Ratios and fractions are related, but not identical",
      body: "A ratio like 3:4 and the fraction 3/4 represent the same relationship, but ratios can compare more than two quantities and are typically written with a colon.",
    },
  ],
  faq: [
    { q: "How do I solve a proportion?", a: "Enter A and B as your known ratio, then C to find the proportional value D that keeps A:B equal to C:D." },
  ],
  related: ["fraction", "percentage"],
};
