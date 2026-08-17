import { Radical } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";

export const rootSchema = z
  .object({
    value: numberField({ label: "Value" }),
    n: numberField({ label: "Root degree", min: 1, max: 100 }),
  })
  .superRefine((data, ctx) => {
    if (data.value < 0 && data.n % 2 === 0) {
      ctx.addIssue({ code: "custom", path: ["value"], message: "An even root of a negative number is not a real number" });
    }
  });

export type RootValues = z.infer<typeof rootSchema>;

function calculate(values: RootValues): CalcResult {
  const { value, n } = values;
  const sign = value < 0 ? -1 : 1;
  const result = sign * Math.pow(Math.abs(value), 1 / n);

  return {
    primary: { key: "result", label: `${n === 2 ? "√" : n === 3 ? "∛" : `${n}th root of`} ${value}`, value: Math.round(result * 1e10) / 1e10, format: "number" },
    secondary: [],
  };
}

export const rootCalculator: CalculatorDef = {
  id: "root",
  slug: "root",
  title: "Root Calculator",
  description: "Calculate the square root, cube root, or any nth root of a number.",
  category: "math",
  icon: Radical,
  keywords: ["square root", "cube root", "nth root", "radical"],
  inputs: [
    { name: "value", label: "Value", kind: "number", defaultValue: "", step: 0.01, required: true },
    { name: "n", label: "Root degree", kind: "number", defaultValue: "2", min: 1, max: 100, step: 1, required: true, helpText: "2 = square root, 3 = cube root, etc." },
  ],
  schema: rootSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "result = value^(1/n).",
  explanation: [
    {
      heading: "Odd roots of negative numbers",
      body: "Odd-degree roots (cube root, 5th root, etc.) of a negative number are real and negative, e.g. the cube root of −8 is −2 — only even-degree roots of negatives are undefined in real numbers.",
    },
  ],
  faq: [
    { q: "How is this different from the Exponent Calculator?", a: "A root is the same as raising to a fractional exponent (1/n) — this calculator just presents it in the more familiar 'root' framing." },
  ],
  related: ["exponent", "quadratic-formula"],
};
