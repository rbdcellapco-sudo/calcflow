import { BarChart2 } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";

function parseNumbers(raw: string): number[] {
  return raw
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number);
}

export const statisticsSchema = z
  .object({
    data: z.string().trim().min(1, "Enter at least one number"),
  })
  .superRefine((values, ctx) => {
    const nums = parseNumbers(values.data);
    if (nums.length === 0 || nums.some((n) => Number.isNaN(n))) {
      ctx.addIssue({ code: "custom", path: ["data"], message: "Enter numbers separated by commas or spaces" });
    }
  });

export type StatisticsValues = z.infer<typeof statisticsSchema>;

function calculate(values: StatisticsValues): CalcResult {
  const data = parseNumbers(values.data);
  const n = data.length;
  const sum = data.reduce((a, b) => a + b, 0);
  const mean = sum / n;

  const sorted = [...data].sort((a, b) => a - b);
  const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[(n - 1) / 2];

  const freq = new Map<number, number>();
  for (const v of data) freq.set(v, (freq.get(v) ?? 0) + 1);
  const maxFreq = Math.max(...freq.values());
  const modes = [...freq.entries()].filter(([, c]) => c === maxFreq).map(([v]) => v);
  const modeDisplay = maxFreq === 1 ? "None (all values unique)" : modes.join(", ");

  const range = sorted[n - 1] - sorted[0];

  const variance = data.reduce((acc, v) => acc + (v - mean) ** 2, 0) / n;
  const sampleVariance = n > 1 ? data.reduce((acc, v) => acc + (v - mean) ** 2, 0) / (n - 1) : 0;
  const stdDev = Math.sqrt(variance);
  const sampleStdDev = Math.sqrt(sampleVariance);

  const round = (x: number) => Math.round(x * 1e6) / 1e6;

  return {
    primary: { key: "mean", label: "Mean (average)", value: round(mean), format: "number" },
    secondary: [
      { key: "median", label: "Median", value: round(median), format: "number" },
      { key: "mode", label: "Mode", value: modeDisplay, format: "text" },
      { key: "range", label: "Range", value: round(range), format: "number" },
      { key: "stdDev", label: "Standard deviation (population)", value: round(stdDev), format: "number" },
      { key: "sampleStdDev", label: "Standard deviation (sample)", value: round(sampleStdDev), format: "number" },
      { key: "variance", label: "Variance (population)", value: round(variance), format: "number" },
      { key: "count", label: "Count", value: n, format: "number" },
      { key: "sum", label: "Sum", value: round(sum), format: "number" },
    ],
  };
}

export const statisticsCalculator: CalculatorDef = {
  id: "statistics",
  slug: "statistics",
  title: "Statistics Calculator",
  description: "Calculate mean, median, mode, range, variance, and standard deviation for a data set.",
  category: "math",
  icon: BarChart2,
  keywords: ["statistics", "mean median mode", "standard deviation", "variance", "average", "range"],
  inputs: [
    { name: "data", label: "Data set", kind: "text", defaultValue: "", required: true, helpText: "Enter numbers separated by commas or spaces, e.g. 4, 8, 15, 16, 23, 42" },
  ],
  schema: statisticsSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Mean = Σx ÷ n. Variance (population) = Σ(x−mean)² ÷ n. Sample variance divides by (n−1) instead. Standard deviation = √variance.",
  explanation: [
    {
      heading: "Population vs. sample standard deviation",
      body: "Use the population version when your data is the entire group you care about. Use the sample version when your data is a sample used to estimate a larger population's spread — dividing by (n−1) corrects for bias in that estimate.",
    },
  ],
  faq: [
    { q: "What if there's no mode?", a: "If every value appears exactly once, there's no meaningful mode — this is shown as 'None' rather than listing every value." },
  ],
  related: ["z-score", "confidence-interval", "average-return"],
};
