import { FunctionSquare } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";

export const quadraticFormulaSchema = z
  .object({
    a: numberField({ label: "a" }),
    b: numberField({ label: "b" }),
    c: numberField({ label: "c" }),
  })
  .superRefine((data, ctx) => {
    if (data.a === 0) ctx.addIssue({ code: "custom", path: ["a"], message: "a can't be zero (this wouldn't be a quadratic equation)" });
  });

export type QuadraticFormulaValues = z.infer<typeof quadraticFormulaSchema>;

function calculate(values: QuadraticFormulaValues): CalcResult {
  const { a, b, c } = values;
  const discriminant = b * b - 4 * a * c;

  if (discriminant > 0) {
    const sqrtD = Math.sqrt(discriminant);
    const x1 = (-b + sqrtD) / (2 * a);
    const x2 = (-b - sqrtD) / (2 * a);
    return {
      primary: { key: "roots", label: "Roots", value: `x = ${Math.round(x1 * 1e8) / 1e8}, x = ${Math.round(x2 * 1e8) / 1e8}`, format: "text" },
      secondary: [{ key: "discriminant", label: "Discriminant", value: Math.round(discriminant * 1e6) / 1e6, format: "number" }],
      notes: ["Two distinct real roots (discriminant > 0)."],
    };
  }

  if (discriminant === 0) {
    const x = -b / (2 * a);
    return {
      primary: { key: "roots", label: "Root", value: `x = ${Math.round(x * 1e8) / 1e8}`, format: "text" },
      secondary: [{ key: "discriminant", label: "Discriminant", value: 0, format: "number" }],
      notes: ["One repeated real root (discriminant = 0)."],
    };
  }

  const realPart = -b / (2 * a);
  const imagPart = Math.sqrt(-discriminant) / (2 * a);
  return {
    primary: { key: "roots", label: "Roots", value: `x = ${Math.round(realPart * 1e6) / 1e6} ± ${Math.round(Math.abs(imagPart) * 1e6) / 1e6}i`, format: "text" },
    secondary: [{ key: "discriminant", label: "Discriminant", value: Math.round(discriminant * 1e6) / 1e6, format: "number" }],
    notes: ["No real roots — the solutions are complex numbers (discriminant < 0)."],
  };
}

export const quadraticFormulaCalculator: CalculatorDef = {
  id: "quadratic-formula",
  slug: "quadratic-formula",
  title: "Quadratic Formula Calculator",
  description: "Solve ax² + bx + c = 0 for real or complex roots.",
  category: "math",
  icon: FunctionSquare,
  keywords: ["quadratic formula", "quadratic equation", "roots", "discriminant"],
  inputs: [
    { name: "a", label: "a", kind: "number", defaultValue: "", step: 0.01, required: true },
    { name: "b", label: "b", kind: "number", defaultValue: "", step: 0.01, required: true },
    { name: "c", label: "c", kind: "number", defaultValue: "", step: 0.01, required: true },
  ],
  schema: quadraticFormulaSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "x = (−b ± √(b² − 4ac)) ÷ 2a, for ax² + bx + c = 0.",
  explanation: [
    {
      heading: "The discriminant tells you what kind of roots to expect",
      body: "A positive discriminant means two real roots, zero means one repeated real root, and a negative discriminant means the roots are complex (involve i = √−1).",
    },
  ],
  faq: [
    { q: "What if a is 0?", a: "Then the equation isn't quadratic — it's linear (bx + c = 0), which this calculator doesn't solve." },
  ],
  related: ["root", "exponent"],
};
