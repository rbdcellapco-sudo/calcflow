import { ListTree } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef, ResultValue } from "../types";
import { numberField } from "../validation";

export const factorSchema = z.object({
  value: numberField({ label: "Number", min: 1, max: 10_000_000, integer: true }),
  compareTo: numberField({ label: "Compare to", min: 1, max: 10_000_000, integer: true, required: false }),
});

export type FactorValues = z.infer<typeof factorSchema>;

function factorsOf(n: number): number[] {
  const factors: number[] = [];
  for (let i = 1; i * i <= n; i++) {
    if (n % i === 0) {
      factors.push(i);
      if (i !== n / i) factors.push(n / i);
    }
  }
  return factors.sort((a, b) => a - b);
}

function calculate(values: FactorValues): CalcResult {
  const factors = factorsOf(values.value);

  const secondary: ResultValue[] = [
    { key: "count", label: "Number of factors", value: factors.length, format: "number" },
  ];

  if (values.compareTo) {
    const otherFactors = factorsOf(values.compareTo);
    const common = factors.filter((f) => otherFactors.includes(f));
    secondary.push({ key: "commonFactors", label: `Common factors with ${values.compareTo}`, value: common.join(", "), format: "text" });
  }

  return {
    primary: { key: "factors", label: "Factors", value: factors.join(", "), format: "text" },
    secondary,
  };
}

export const factorCalculator: CalculatorDef = {
  id: "factor",
  slug: "factor",
  title: "Factor Calculator",
  description: "List all factors of a number, and the common factors shared with another number.",
  category: "math",
  icon: ListTree,
  keywords: ["factors", "factor calculator", "common factors", "divisors"],
  inputs: [
    { name: "value", label: "Number", kind: "number", defaultValue: "", min: 1, max: 10_000_000, step: 1, required: true },
  ],
  advancedInputs: [
    { name: "compareTo", label: "Compare to (optional)", kind: "number", defaultValue: "", min: 1, max: 10_000_000, step: 1, required: false, helpText: "Enter a second number to find common factors." },
  ],
  schema: factorSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "A factor of n is any integer that divides n with no remainder, found by testing divisors up to √n.",
  explanation: [
    {
      heading: "Factors always come in pairs",
      body: "Every factor below the square root of a number pairs with one above it (e.g. for 24: 1×24, 2×12, 3×8, 4×6) — which is why this calculator only needs to search up to √n.",
    },
  ],
  faq: [
    { q: "What's the difference between this and Prime Factorization?", a: "This lists every factor (divisor), while prime factorization breaks a number down into only its prime building blocks." },
  ],
  related: ["prime-factorization", "gcf", "lcm"],
};
