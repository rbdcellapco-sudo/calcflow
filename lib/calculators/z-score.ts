import { LineChart } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";

export const zScoreSchema = z.object({
  value: numberField({ label: "Value" }),
  mean: numberField({ label: "Mean" }),
  stdDev: numberField({ label: "Standard deviation", min: 0.0000001 }),
});

export type ZScoreValues = z.infer<typeof zScoreSchema>;

// Abramowitz & Stegun approximation of the standard normal CDF.
function normalCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  let prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  if (z > 0) prob = 1 - prob;
  return prob;
}

function calculate(values: ZScoreValues): CalcResult {
  const z = (values.value - values.mean) / values.stdDev;
  const percentile = normalCdf(z) * 100;

  return {
    primary: { key: "zScore", label: "Z-score", value: Math.round(z * 1000) / 1000, format: "number" },
    secondary: [{ key: "percentile", label: "Percentile", value: Math.round(percentile * 100) / 100, format: "percentage" }],
  };
}

export const zScoreCalculator: CalculatorDef = {
  id: "z-score",
  slug: "z-score",
  title: "Z-score Calculator",
  description: "Calculate how many standard deviations a value is from the mean, and its percentile.",
  category: "math",
  icon: LineChart,
  keywords: ["z-score", "standard score", "percentile", "normal distribution"],
  inputs: [
    { name: "value", label: "Value", kind: "number", defaultValue: "", step: 0.01, required: true },
    { name: "mean", label: "Mean", kind: "number", defaultValue: "", step: 0.01, required: true },
    { name: "stdDev", label: "Standard deviation", kind: "number", defaultValue: "", step: 0.01, required: true },
  ],
  schema: zScoreSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "z = (value − mean) ÷ standard deviation. Percentile is derived from the standard normal cumulative distribution function.",
  explanation: [
    {
      heading: "Assumes a normal distribution",
      body: "The percentile figure assumes your data follows (or approximates) a normal distribution — for skewed data, the percentile interpretation may not hold.",
    },
  ],
  faq: [
    { q: "What does a z-score of 0 mean?", a: "It means the value is exactly at the mean — positive z-scores are above the mean, negative ones are below." },
  ],
  related: ["statistics", "confidence-interval", "p-value"],
};
