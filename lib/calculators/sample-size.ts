import { Users } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";
import { ceilSafe } from "../format";

const CONFIDENCE_LEVELS = ["90", "95", "99"] as const;
const Z_SCORES: Record<(typeof CONFIDENCE_LEVELS)[number], number> = { "90": 1.645, "95": 1.96, "99": 2.576 };

export const sampleSizeSchema = z.object({
  confidenceLevel: selectField(CONFIDENCE_LEVELS, "Confidence level"),
  marginOfError: numberField({ label: "Margin of error", min: 0.1, max: 50 }),
  populationProportion: numberField({ label: "Estimated population proportion", min: 1, max: 99, required: false }),
  populationSize: numberField({ label: "Population size", min: 1, required: false }),
});

export type SampleSizeValues = z.infer<typeof sampleSizeSchema>;

function calculate(values: SampleSizeValues): CalcResult {
  const z = Z_SCORES[values.confidenceLevel];
  const p = (values.populationProportion ?? 50) / 100;
  const e = values.marginOfError / 100;

  const nInfinite = (z * z * p * (1 - p)) / (e * e);

  let finalN = nInfinite;
  if (values.populationSize) {
    finalN = nInfinite / (1 + (nInfinite - 1) / values.populationSize);
  }

  return {
    primary: { key: "sampleSize", label: "Required sample size", value: ceilSafe(finalN), format: "number" },
    secondary: [{ key: "nInfinite", label: "Unadjusted (large population)", value: ceilSafe(nInfinite), format: "number" }],
  };
}

export const sampleSizeCalculator: CalculatorDef = {
  id: "sample-size",
  slug: "sample-size",
  title: "Sample Size Calculator",
  description: "Find the sample size needed for a survey or study at a given confidence level.",
  category: "math",
  icon: Users,
  keywords: ["sample size", "survey sample size", "statistical power", "margin of error"],
  inputs: [
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
    { name: "marginOfError", label: "Margin of error (%)", kind: "percentage", defaultValue: "5", min: 0.1, max: 50, required: true },
  ],
  advancedInputs: [
    { name: "populationProportion", label: "Estimated population proportion (%)", kind: "percentage", defaultValue: "50", min: 1, max: 99, required: false, helpText: "Use 50% if unknown — it produces the most conservative (largest) sample size." },
    { name: "populationSize", label: "Population size (optional)", kind: "number", defaultValue: "", min: 1, step: 1, required: false, helpText: "Leave blank for a very large or unknown population." },
  ],
  schema: sampleSizeSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "n = z² × p(1−p) ÷ e². With a known finite population N, this is adjusted: n_adj = n ÷ (1 + (n−1)/N).",
  explanation: [
    {
      heading: "Why 50% proportion is the safe default",
      body: "p(1−p) is maximized at p=50%, which produces the largest (most conservative) required sample size — a safe assumption when you don't have a prior estimate.",
    },
  ],
  faq: [
    { q: "When does population size matter?", a: "For small or moderate populations (e.g. surveying employees at a 200-person company), the finite population correction can meaningfully reduce the required sample size." },
  ],
  related: ["confidence-interval", "statistics", "probability"],
};
