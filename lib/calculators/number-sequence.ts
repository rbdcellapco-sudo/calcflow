import { ListOrdered } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";

const SEQUENCE_TYPES = ["arithmetic", "geometric"] as const;

export const numberSequenceSchema = z.object({
  sequenceType: selectField(SEQUENCE_TYPES, "Sequence type"),
  firstTerm: numberField({ label: "First term" }),
  step: numberField({ label: "Common difference / ratio" }),
  n: numberField({ label: "Find term number", min: 1, max: 10000, integer: true }),
});

export type NumberSequenceValues = z.infer<typeof numberSequenceSchema>;

function calculate(values: NumberSequenceValues): CalcResult {
  const { sequenceType, firstTerm, step, n } = values;
  let nthTerm: number;
  let sumOfN: number;

  if (sequenceType === "arithmetic") {
    nthTerm = firstTerm + (n - 1) * step;
    sumOfN = (n / 2) * (2 * firstTerm + (n - 1) * step);
  } else {
    nthTerm = firstTerm * Math.pow(step, n - 1);
    sumOfN = step === 1 ? firstTerm * n : (firstTerm * (Math.pow(step, n) - 1)) / (step - 1);
  }

  const previewCount = Math.min(n, 10);
  const preview = Array.from({ length: previewCount }, (_, i) =>
    sequenceType === "arithmetic" ? firstTerm + i * step : firstTerm * Math.pow(step, i)
  );

  return {
    primary: { key: "nthTerm", label: `Term #${n}`, value: Math.round(nthTerm * 1e6) / 1e6, format: "number" },
    secondary: [
      { key: "sumOfN", label: `Sum of first ${n} terms`, value: Math.round(sumOfN * 1e6) / 1e6, format: "number" },
      { key: "preview", label: `First ${previewCount} terms`, value: preview.map((v) => Math.round(v * 1e6) / 1e6).join(", "), format: "text" },
    ],
  };
}

export const numberSequenceCalculator: CalculatorDef = {
  id: "number-sequence",
  slug: "number-sequence",
  title: "Number Sequence Calculator",
  description: "Find any term and the sum of an arithmetic or geometric sequence.",
  category: "math",
  icon: ListOrdered,
  keywords: ["arithmetic sequence", "geometric sequence", "nth term", "sequence sum"],
  inputs: [
    {
      name: "sequenceType",
      label: "Sequence type",
      kind: "segmented",
      defaultValue: "arithmetic",
      options: [
        { value: "arithmetic", label: "Arithmetic" },
        { value: "geometric", label: "Geometric" },
      ],
    },
    { name: "firstTerm", label: "First term", kind: "number", defaultValue: "", step: 0.01, required: true },
    { name: "step", label: "Common difference / ratio", kind: "number", defaultValue: "", step: 0.01, required: true },
    { name: "n", label: "Find term number", kind: "number", defaultValue: "10", min: 1, max: 10000, step: 1, required: true },
  ],
  schema: numberSequenceSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  dynamicLabels: (values) => (values.sequenceType === "geometric" ? { step: "Common ratio" } : { step: "Common difference" }),
  formula: "Arithmetic: aₙ = a₁ + (n−1)d, sum = n/2 × (2a₁ + (n−1)d). Geometric: aₙ = a₁ × rⁿ⁻¹, sum = a₁ × (rⁿ−1)/(r−1).",
  explanation: [
    {
      heading: "Arithmetic vs. geometric",
      body: "In an arithmetic sequence, each term adds a fixed amount to the previous one. In a geometric sequence, each term multiplies the previous one by a fixed ratio.",
    },
  ],
  faq: [
    { q: "What if my ratio is negative or a fraction?", a: "Geometric sequences work fine with negative ratios (alternating sign) or fractional ratios (shrinking toward zero) — just enter the value directly." },
  ],
  related: ["statistics", "average-return"],
};
