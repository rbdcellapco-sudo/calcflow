import { Divide } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";

export const longDivisionSchema = z
  .object({
    dividend: numberField({ label: "Dividend", integer: true }),
    divisor: numberField({ label: "Divisor", integer: true }),
  })
  .superRefine((data, ctx) => {
    if (data.divisor === 0) ctx.addIssue({ code: "custom", path: ["divisor"], message: "Divisor can't be zero" });
  });

export type LongDivisionValues = z.infer<typeof longDivisionSchema>;

function calculate(values: LongDivisionValues): CalcResult {
  const { dividend, divisor } = values;
  const quotient = Math.trunc(dividend / divisor);
  const remainder = dividend - quotient * divisor;
  const decimalResult = dividend / divisor;

  return {
    primary: { key: "quotient", label: "Quotient", value: quotient, format: "number" },
    secondary: [
      { key: "remainder", label: "Remainder", value: remainder, format: "number" },
      { key: "decimal", label: "As a decimal", value: Math.round(decimalResult * 1e8) / 1e8, format: "number" },
      { key: "expression", label: "Result", value: `${dividend} ÷ ${divisor} = ${quotient} R ${remainder}`, format: "text" },
    ],
  };
}

export const longDivisionCalculator: CalculatorDef = {
  id: "long-division",
  slug: "long-division",
  title: "Long Division Calculator",
  description: "Divide two numbers and see the quotient, remainder, and decimal result.",
  category: "math",
  icon: Divide,
  keywords: ["long division", "quotient", "remainder", "division with remainder"],
  inputs: [
    { name: "dividend", label: "Dividend", kind: "number", defaultValue: "", step: 1, required: true },
    { name: "divisor", label: "Divisor", kind: "number", defaultValue: "", step: 1, required: true },
  ],
  schema: longDivisionSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Dividend = Divisor × Quotient + Remainder, where 0 ≤ |Remainder| < |Divisor|.",
  explanation: [
    {
      heading: "Quotient and remainder vs. decimal",
      body: "The quotient and remainder give you the whole-number division result (useful for things like splitting items evenly), while the decimal gives the exact fractional answer.",
    },
  ],
  faq: [
    { q: "What if the dividend is negative?", a: "The quotient truncates toward zero and the remainder takes the sign needed to satisfy Dividend = Divisor × Quotient + Remainder." },
  ],
  related: ["fraction", "rounding"],
};
