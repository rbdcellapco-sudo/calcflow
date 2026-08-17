import { GitPullRequestArrow } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";

const CONFIDENCE_LEVELS = ["90", "95", "99"] as const;
const Z_SCORES: Record<(typeof CONFIDENCE_LEVELS)[number], number> = { "90": 1.645, "95": 1.96, "99": 2.576 };

export const confidenceIntervalSchema = z.object({
  sampleMean: numberField({ label: "Sample mean" }),
  stdDev: numberField({ label: "Standard deviation", min: 0 }),
  sampleSize: numberField({ label: "Sample size", min: 1, integer: true }),
  confidenceLevel: selectField(CONFIDENCE_LEVELS, "Confidence level"),
});

export type ConfidenceIntervalValues = z.infer<typeof confidenceIntervalSchema>;

function calculate(values: ConfidenceIntervalValues): CalcResult {
  const zScore = Z_SCORES[values.confidenceLevel];
  const marginOfError = zScore * (values.stdDev / Math.sqrt(values.sampleSize));
  const lower = values.sampleMean - marginOfError;
  const upper = values.sampleMean + marginOfError;

  return {
    primary: { key: "interval", label: `${values.confidenceLevel}% confidence interval`, value: `${Math.round(lower * 1000) / 1000} to ${Math.round(upper * 1000) / 1000}`, format: "text" },
    secondary: [{ key: "marginOfError", label: "Margin of error", value: Math.round(marginOfError * 1000) / 1000, format: "number" }],
  };
}

export const confidenceIntervalCalculator: CalculatorDef = {
  id: "confidence-interval",
  slug: "confidence-interval",
  title: "Confidence Interval Calculator",
  description: "Calculate a confidence interval and margin of error for a sample mean.",
  category: "math",
  icon: GitPullRequestArrow,
  keywords: ["confidence interval", "margin of error", "statistics", "sample mean"],
  inputs: [
    { name: "sampleMean", label: "Sample mean", kind: "number", defaultValue: "", step: 0.01, required: true },
    { name: "stdDev", label: "Standard deviation", kind: "number", defaultValue: "", step: 0.01, required: true },
    { name: "sampleSize", label: "Sample size", kind: "number", defaultValue: "", min: 1, step: 1, required: true },
    {
      name: "confidenceLevel",
      label: "Confidence level",
      kind: "select",
      defaultValue: "95",
      options: [
        { value: "90", label: "90%" },
        { value: "95", label: "95%" },
        { value: "99", label: "99%" },
      ],
    },
  ],
  schema: confidenceIntervalSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Margin of error = z × (standard deviation ÷ √sample size). Interval = sample mean ± margin of error.",
  explanation: [
    {
      heading: "What 'confident' means here",
      body: "A 95% confidence interval means that if you repeated the sampling process many times, about 95% of the resulting intervals would contain the true population mean — it's not a 95% chance this specific interval is correct.",
    },
  ],
  faq: [
    { q: "Why does a bigger sample narrow the interval?", a: "The margin of error shrinks with the square root of sample size, since larger samples give a more precise estimate of the population mean." },
  ],
  related: ["z-score", "sample-size", "statistics"],
};
