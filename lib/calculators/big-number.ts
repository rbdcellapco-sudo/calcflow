import { Infinity as InfinityIcon } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { selectField } from "../validation";
import { Decimal } from "../decimal-utils";

const OPERATIONS = ["add", "subtract", "multiply", "divide", "power"] as const;

function decimalField(label: string) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .refine((v) => {
      try {
        new Decimal(v);
        return true;
      } catch {
        return false;
      }
    }, `${label} must be a valid number`);
}

export const bigNumberSchema = z.object({
  num1: decimalField("First number"),
  operation: selectField(OPERATIONS, "Operation"),
  num2: decimalField("Second number"),
});

export type BigNumberValues = z.infer<typeof bigNumberSchema>;

function calculate(values: BigNumberValues): CalcResult {
  const a = new Decimal(values.num1);
  const b = new Decimal(values.num2);
  let result: Decimal;

  switch (values.operation) {
    case "add":
      result = a.plus(b);
      break;
    case "subtract":
      result = a.minus(b);
      break;
    case "multiply":
      result = a.times(b);
      break;
    case "divide":
      if (b.isZero()) throw new Error("Cannot divide by zero");
      result = a.dividedBy(b);
      break;
    case "power":
      result = a.pow(b);
      break;
  }

  return {
    primary: { key: "result", label: "Result", value: result.toFixed(), format: "text" },
    secondary: [],
    notes: ["Computed with 40 significant digits of precision — plenty for numbers far beyond standard floating-point range."],
  };
}

export const bigNumberCalculator: CalculatorDef = {
  id: "big-number",
  slug: "big-number",
  title: "Big Number Calculator",
  description: "Perform arithmetic on very large or very precise numbers beyond standard number limits.",
  category: "math",
  icon: InfinityIcon,
  keywords: ["big number", "large number arithmetic", "arbitrary precision", "big integer"],
  inputs: [
    { name: "num1", label: "First number", kind: "text", defaultValue: "", required: true },
    {
      name: "operation",
      label: "Operation",
      kind: "segmented",
      defaultValue: "multiply",
      options: [
        { value: "add", label: "+" },
        { value: "subtract", label: "−" },
        { value: "multiply", label: "×" },
        { value: "divide", label: "÷" },
        { value: "power", label: "^" },
      ],
    },
    { name: "num2", label: "Second number", kind: "text", defaultValue: "", required: true },
  ],
  schema: bigNumberSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Uses arbitrary-precision decimal arithmetic instead of standard floating-point, avoiding the rounding errors and range limits of JavaScript's native number type.",
  explanation: [
    {
      heading: "Why not just use a regular calculator?",
      body: "Standard floating-point numbers lose precision beyond about 15-17 significant digits and can't represent some very large integers exactly — this calculator avoids both problems.",
    },
  ],
  faq: [
    { q: "Is there a size limit?", a: "Results are computed to 40 significant digits, which comfortably covers the vast majority of practical big-number use cases." },
  ],
  related: ["scientific-notation", "matrix"],
};
