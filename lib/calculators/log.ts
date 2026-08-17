import { Sigma } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";

export const logSchema = z
  .object({
    value: numberField({ label: "Value", min: 0.0000000001 }),
    base: numberField({ label: "Base", min: 0.0000000001 }),
  })
  .superRefine((data, ctx) => {
    if (data.base === 1) ctx.addIssue({ code: "custom", path: ["base"], message: "Base can't be 1" });
  });

export type LogValues = z.infer<typeof logSchema>;

function calculate(values: LogValues): CalcResult {
  const result = Math.log(values.value) / Math.log(values.base);

  return {
    primary: { key: "result", label: `log₍${values.base}₎(${values.value})`, value: Math.round(result * 1e8) / 1e8, format: "number" },
    secondary: [
      { key: "ln", label: "Natural log (ln)", value: Math.round(Math.log(values.value) * 1e8) / 1e8, format: "number" },
      { key: "log10", label: "Base-10 log", value: Math.round(Math.log10(values.value) * 1e8) / 1e8, format: "number" },
    ],
  };
}

export const logCalculator: CalculatorDef = {
  id: "log",
  slug: "log",
  title: "Log Calculator",
  description: "Calculate a logarithm in any base, plus natural log and base-10 log.",
  category: "math",
  icon: Sigma,
  keywords: ["logarithm", "log calculator", "natural log", "ln", "change of base"],
  inputs: [
    { name: "value", label: "Value", kind: "number", defaultValue: "", step: 0.01, required: true },
    { name: "base", label: "Base", kind: "number", defaultValue: "10", step: 0.01, required: true },
  ],
  schema: logSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Change of base: logᵦ(x) = ln(x) ÷ ln(b).",
  explanation: [
    {
      heading: "What a logarithm answers",
      body: "logᵦ(x) answers 'to what power must b be raised to get x?' — it's the inverse operation of exponentiation.",
    },
  ],
  faq: [
    { q: "Why must value and base be positive?", a: "Logarithms of zero or negative numbers, and bases of 1 or less than or equal to 0, aren't defined for real numbers." },
  ],
  related: ["exponent", "root", "half-life"],
};
