import { Group } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";

export const gcfSchema = z.object({
  a: numberField({ label: "First number", min: 1, max: 1_000_000, integer: true }),
  b: numberField({ label: "Second number", min: 1, max: 1_000_000, integer: true }),
  c: numberField({ label: "Third number", min: 1, max: 1_000_000, integer: true, required: false }),
});

export type GcfValues = z.infer<typeof gcfSchema>;

function gcdOf(a: number, b: number): number {
  while (b) [a, b] = [b, a % b];
  return a;
}

function calculate(values: GcfValues): CalcResult {
  let result = gcdOf(values.a, values.b);
  if (values.c) result = gcdOf(result, values.c);

  return {
    primary: { key: "gcf", label: "Greatest common factor", value: result, format: "number" },
    secondary: [],
  };
}

export const gcfCalculator: CalculatorDef = {
  id: "gcf",
  slug: "gcf",
  title: "Greatest Common Factor (GCF) Calculator",
  description: "Find the greatest common factor (GCD) of two or three numbers.",
  category: "math",
  icon: Group,
  keywords: ["gcf", "gcd", "greatest common factor", "greatest common divisor"],
  inputs: [
    { name: "a", label: "First number", kind: "number", defaultValue: "", min: 1, max: 1_000_000, step: 1, required: true },
    { name: "b", label: "Second number", kind: "number", defaultValue: "", min: 1, max: 1_000_000, step: 1, required: true },
  ],
  advancedInputs: [
    { name: "c", label: "Third number (optional)", kind: "number", defaultValue: "", min: 1, max: 1_000_000, step: 1, required: false },
  ],
  schema: gcfSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Computed via the Euclidean algorithm: GCD(a, b) = GCD(b, a mod b), repeated until the remainder is 0.",
  explanation: [
    {
      heading: "Common use: simplifying fractions",
      body: "Dividing both the numerator and denominator of a fraction by their GCF reduces it to lowest terms.",
    },
  ],
  faq: [
    { q: "What does it mean if the GCF is 1?", a: "It means the numbers are coprime — they share no common factors other than 1." },
  ],
  related: ["lcm", "fraction", "factor"],
};
