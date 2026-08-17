import { BarChart3 } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";
import { toRounded, Decimal } from "../decimal-utils";

export const averageReturnSchema = z.object({
  year1: numberField({ label: "Year 1 return (%)" }),
  year2: numberField({ label: "Year 2 return (%)" }),
  year3: numberField({ label: "Year 3 return (%)", required: false }),
  year4: numberField({ label: "Year 4 return (%)", required: false }),
  year5: numberField({ label: "Year 5 return (%)", required: false }),
});

export type AverageReturnValues = z.infer<typeof averageReturnSchema>;

function calculate(values: AverageReturnValues): CalcResult {
  const returns = [values.year1, values.year2, values.year3, values.year4, values.year5].filter(
    (r): r is number => r !== undefined
  );

  const arithmeticMean = returns.reduce((sum, r) => sum + r, 0) / returns.length;

  const product = returns.reduce((acc, r) => acc * (1 + r / 100), 1);
  const geometricMean = (Math.pow(product, 1 / returns.length) - 1) * 100;

  return {
    primary: { key: "geometricMean", label: "Geometric mean (CAGR)", value: toRounded(new Decimal(geometricMean)), format: "percentage" },
    secondary: [
      { key: "arithmeticMean", label: "Arithmetic mean", value: toRounded(new Decimal(arithmeticMean)), format: "percentage" },
      { key: "yearsIncluded", label: "Years included", value: returns.length, format: "number" },
    ],
    notes: ["The geometric mean accounts for compounding and better reflects actual investment growth. The arithmetic mean is a simple average and can overstate real returns, especially with volatile year-to-year results."],
  };
}

export const averageReturnCalculator: CalculatorDef = {
  id: "average-return",
  slug: "average-return",
  title: "Average Return Calculator",
  description: "Compare the arithmetic mean and geometric mean (CAGR) of a series of yearly returns.",
  category: "finance",
  icon: BarChart3,
  keywords: ["average return", "geometric mean", "cagr", "arithmetic mean"],
  inputs: [
    { name: "year1", label: "Year 1 return (%)", kind: "number", defaultValue: "", required: true },
    { name: "year2", label: "Year 2 return (%)", kind: "number", defaultValue: "", required: true },
    { name: "year3", label: "Year 3 return (%)", kind: "number", defaultValue: "", required: false },
  ],
  advancedInputs: [
    { name: "year4", label: "Year 4 return (%)", kind: "number", defaultValue: "", required: false },
    { name: "year5", label: "Year 5 return (%)", kind: "number", defaultValue: "", required: false },
  ],
  schema: averageReturnSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Arithmetic mean = Σ returns ÷ n. Geometric mean = [Π(1 + returnᵢ)]^(1/n) − 1.",
  explanation: [
    {
      heading: "Why the two means disagree",
      body: "A 50% gain followed by a 50% loss averages to 0% arithmetically, but you'd actually be down 25% — the geometric mean correctly shows a negative result because losses hurt compounding more than equivalent gains help it.",
    },
  ],
  faq: [
    { q: "Which one should I use to evaluate an investment?", a: "The geometric mean (CAGR) is almost always the more accurate measure of actual realized investment performance over multiple periods." },
  ],
  related: ["mutual-fund", "roi", "compound-interest"],
};
