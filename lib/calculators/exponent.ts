import { Superscript } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";

export const exponentSchema = z.object({
  base: numberField({ label: "Base" }),
  exponent: numberField({ label: "Exponent" }),
});

export type ExponentValues = z.infer<typeof exponentSchema>;

function calculate(values: ExponentValues): CalcResult {
  const result = Math.pow(values.base, values.exponent);
  if (!Number.isFinite(result)) throw new Error("Result is too large or undefined for these inputs");

  return {
    primary: { key: "result", label: `${values.base}^${values.exponent}`, value: result, format: "number" },
    secondary: [],
  };
}

export const exponentCalculator: CalculatorDef = {
  id: "exponent",
  slug: "exponent",
  title: "Exponent Calculator",
  description: "Calculate a base raised to any power, including negative and fractional exponents.",
  category: "math",
  icon: Superscript,
  keywords: ["exponent", "power", "base raised to", "x to the power of y"],
  inputs: [
    { name: "base", label: "Base", kind: "number", defaultValue: "", step: 0.01, required: true },
    { name: "exponent", label: "Exponent", kind: "number", defaultValue: "", step: 0.01, required: true },
  ],
  schema: exponentSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "result = base^exponent.",
  explanation: [
    {
      heading: "Fractional and negative exponents",
      body: "A fractional exponent like 0.5 is equivalent to a square root, and a negative exponent gives the reciprocal (e.g. 2⁻² = 1/2² = 0.25).",
    },
  ],
  faq: [
    { q: "What if the result is undefined?", a: "A negative base with a fractional exponent (like a square root of a negative number) has no real result, since it would require an imaginary number." },
  ],
  related: ["root", "scientific-notation", "log"],
};
