import { FlaskConical } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";

const TAIL_TYPES = ["two-tailed", "left-tailed", "right-tailed"] as const;

export const pValueSchema = z.object({
  zScore: numberField({ label: "Z-score" }),
  tailType: selectField(TAIL_TYPES, "Test type"),
});

export type PValueValues = z.infer<typeof pValueSchema>;

function normalCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  let prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  if (z > 0) prob = 1 - prob;
  return prob;
}

function calculate(values: PValueValues): CalcResult {
  const { zScore, tailType } = values;
  let pValue: number;

  if (tailType === "left-tailed") {
    pValue = normalCdf(zScore);
  } else if (tailType === "right-tailed") {
    pValue = 1 - normalCdf(zScore);
  } else {
    pValue = 2 * (1 - normalCdf(Math.abs(zScore)));
  }

  const significantAt = pValue < 0.01 ? "1%" : pValue < 0.05 ? "5%" : pValue < 0.1 ? "10%" : "not significant at common thresholds";

  return {
    primary: { key: "pValue", label: "P-value", value: Math.round(pValue * 1e6) / 1e6, format: "number" },
    secondary: [{ key: "significance", label: "Significant at", value: significantAt, format: "text" }],
    notes: ["Significance depends on the threshold (alpha) your analysis uses — commonly 0.05."],
  };
}

export const pValueCalculator: CalculatorDef = {
  id: "p-value",
  slug: "p-value",
  title: "P-value Calculator",
  description: "Find the p-value for a z-score under one-tailed or two-tailed hypothesis tests.",
  category: "math",
  icon: FlaskConical,
  keywords: ["p-value", "hypothesis testing", "statistical significance", "z test"],
  inputs: [
    { name: "zScore", label: "Z-score", kind: "number", defaultValue: "", step: 0.01, required: true },
    {
      name: "tailType",
      label: "Test type",
      kind: "segmented",
      defaultValue: "two-tailed",
      options: [
        { value: "two-tailed", label: "Two-tailed" },
        { value: "left-tailed", label: "Left-tailed" },
        { value: "right-tailed", label: "Right-tailed" },
      ],
    },
  ],
  schema: pValueSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Two-tailed: p = 2 × (1 − Φ(|z|)). One-tailed: p = Φ(z) or 1 − Φ(z), where Φ is the standard normal CDF.",
  explanation: [
    {
      heading: "Choosing a tail type",
      body: "Use two-tailed when testing for any difference (in either direction). Use one-tailed (left or right) only when you have a specific directional hypothesis decided before seeing the data.",
    },
  ],
  faq: [
    { q: "What does a small p-value mean?", a: "A small p-value suggests the observed result would be unlikely if the null hypothesis were true — but it doesn't measure effect size or practical importance." },
  ],
  related: ["z-score", "confidence-interval"],
};
