import { Divide } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";

const OPS = ["add", "subtract", "multiply", "divide"] as const;

export const fractionSchema = z
  .object({
    num1: numberField({ label: "Numerator 1", integer: true }),
    den1: numberField({ label: "Denominator 1", integer: true }),
    op: selectField(OPS, "Operation"),
    num2: numberField({ label: "Numerator 2", integer: true }),
    den2: numberField({ label: "Denominator 2", integer: true }),
  })
  .superRefine((data, ctx) => {
    if (data.den1 === 0) ctx.addIssue({ code: "custom", path: ["den1"], message: "Denominator can't be zero" });
    if (data.den2 === 0) ctx.addIssue({ code: "custom", path: ["den2"], message: "Denominator can't be zero" });
  });

export type FractionValues = z.infer<typeof fractionSchema>;

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

function simplify(num: number, den: number): [number, number] {
  const sign = den < 0 ? -1 : 1;
  num *= sign;
  den *= sign;
  const g = gcd(num, den);
  return [num / g, den / g];
}

function calculate(values: FractionValues): CalcResult {
  const { num1, den1, num2, den2, op } = values;
  let resultNum: number;
  let resultDen: number;

  switch (op) {
    case "add":
      resultNum = num1 * den2 + num2 * den1;
      resultDen = den1 * den2;
      break;
    case "subtract":
      resultNum = num1 * den2 - num2 * den1;
      resultDen = den1 * den2;
      break;
    case "multiply":
      resultNum = num1 * num2;
      resultDen = den1 * den2;
      break;
    case "divide":
      resultNum = num1 * den2;
      resultDen = den1 * num2;
      break;
  }

  const [simplifiedNum, simplifiedDen] = simplify(resultNum, resultDen);
  const decimal = simplifiedNum / simplifiedDen;

  return {
    primary: { key: "result", label: "Result", value: `${simplifiedNum}/${simplifiedDen}`, format: "text" },
    secondary: [
      { key: "decimal", label: "As a decimal", value: Math.round(decimal * 1e8) / 1e8, format: "number" },
    ],
  };
}

export const fractionCalculator: CalculatorDef = {
  id: "fraction",
  slug: "fraction",
  title: "Fraction Calculator",
  description: "Add, subtract, multiply, or divide fractions, with the result automatically simplified.",
  category: "math",
  icon: Divide,
  keywords: ["fractions", "simplify fraction", "add fractions", "reduce fraction"],
  inputs: [
    { name: "num1", label: "Numerator 1", kind: "number", defaultValue: "", step: 1, required: true },
    { name: "den1", label: "Denominator 1", kind: "number", defaultValue: "", step: 1, required: true },
    {
      name: "op",
      label: "Operation",
      kind: "segmented",
      defaultValue: "add",
      options: [
        { value: "add", label: "+" },
        { value: "subtract", label: "−" },
        { value: "multiply", label: "×" },
        { value: "divide", label: "÷" },
      ],
    },
    { name: "num2", label: "Numerator 2", kind: "number", defaultValue: "", step: 1, required: true },
    { name: "den2", label: "Denominator 2", kind: "number", defaultValue: "", step: 1, required: true },
  ],
  schema: fractionSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "a/b + c/d = (ad + bc)/bd. Multiplication and division follow the standard cross-multiplication rules, with the result reduced by the greatest common divisor.",
  explanation: [
    {
      heading: "Always simplified",
      body: "The result is automatically reduced to lowest terms by dividing both numerator and denominator by their greatest common divisor.",
    },
  ],
  faq: [
    { q: "Can I enter negative fractions?", a: "Yes — use a negative numerator or denominator, and the sign will be normalized in the simplified result." },
  ],
  related: ["ratio", "percentage", "rounding"],
};
