import { Combine } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";

export const lcmSchema = z.object({
  a: numberField({ label: "First number", min: 1, max: 1_000_000, integer: true }),
  b: numberField({ label: "Second number", min: 1, max: 1_000_000, integer: true }),
  c: numberField({ label: "Third number", min: 1, max: 1_000_000, integer: true, required: false }),
});

export type LcmValues = z.infer<typeof lcmSchema>;

function gcdOf(a: number, b: number): number {
  while (b) [a, b] = [b, a % b];
  return a;
}
function lcmOf(a: number, b: number): number {
  return (a / gcdOf(a, b)) * b;
}

function calculate(values: LcmValues): CalcResult {
  let result = lcmOf(values.a, values.b);
  if (values.c) result = lcmOf(result, values.c);

  return {
    primary: { key: "lcm", label: "Least common multiple", value: result, format: "number" },
    secondary: [],
  };
}

export const lcmCalculator: CalculatorDef = {
  id: "lcm",
  slug: "lcm",
  title: "Least Common Multiple (LCM) Calculator",
  description: "Find the least common multiple of two or three numbers.",
  category: "math",
  icon: Combine,
  keywords: ["lcm", "least common multiple", "lowest common multiple"],
  inputs: [
    { name: "a", label: "First number", kind: "number", defaultValue: "", min: 1, max: 1_000_000, step: 1, required: true },
    { name: "b", label: "Second number", kind: "number", defaultValue: "", min: 1, max: 1_000_000, step: 1, required: true },
  ],
  advancedInputs: [
    { name: "c", label: "Third number (optional)", kind: "number", defaultValue: "", min: 1, max: 1_000_000, step: 1, required: false },
  ],
  schema: lcmSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "LCM(a, b) = (a × b) ÷ GCD(a, b), computed pairwise for three numbers.",
  explanation: [
    {
      heading: "Common use: adding fractions",
      body: "LCM is most often used to find a common denominator when adding or comparing fractions with different denominators.",
    },
  ],
  faq: [
    { q: "What's the LCM of two numbers that share no factors?", a: "If two numbers are coprime (GCD = 1), their LCM is simply their product." },
  ],
  related: ["gcf", "fraction", "factor"],
};
