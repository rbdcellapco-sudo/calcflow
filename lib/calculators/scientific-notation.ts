import { Sigma } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";

export const scientificNotationSchema = z.object({
  value: numberField({ label: "Value" }),
});

export type ScientificNotationValues = z.infer<typeof scientificNotationSchema>;

function calculate(values: ScientificNotationValues): CalcResult {
  const { value } = values;
  if (value === 0) {
    return {
      primary: { key: "notation", label: "Scientific notation", value: "0 × 10⁰", format: "text" },
      secondary: [],
    };
  }

  const exponent = Math.floor(Math.log10(Math.abs(value)));
  const mantissa = value / Math.pow(10, exponent);
  const roundedMantissa = Math.round(mantissa * 1e10) / 1e10;

  const superscriptDigits: Record<string, string> = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
  const expDisplay = String(exponent).split("").map((c) => superscriptDigits[c] ?? c).join("");

  return {
    primary: { key: "notation", label: "Scientific notation", value: `${roundedMantissa} × 10${expDisplay}`, format: "text" },
    secondary: [
      { key: "mantissa", label: "Mantissa (coefficient)", value: roundedMantissa, format: "number" },
      { key: "exponent", label: "Exponent", value: exponent, format: "number" },
    ],
  };
}

export const scientificNotationCalculator: CalculatorDef = {
  id: "scientific-notation",
  slug: "scientific-notation",
  title: "Scientific Notation Calculator",
  description: "Convert any number into scientific notation, showing the mantissa and exponent.",
  category: "math",
  icon: Sigma,
  keywords: ["scientific notation", "standard form", "mantissa", "exponent notation"],
  inputs: [
    { name: "value", label: "Value", kind: "number", defaultValue: "", required: true },
  ],
  schema: scientificNotationSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Any number can be written as m × 10ⁿ, where 1 ≤ |m| < 10 and n is an integer.",
  explanation: [
    {
      heading: "Why scientific notation is useful",
      body: "It makes very large or very small numbers easier to read and compare, and is standard in science and engineering for exactly that reason.",
    },
  ],
  faq: [
    { q: "What about very large numbers beyond normal floating-point precision?", a: "For numbers too large for standard precision, use the Big Number Calculator instead." },
  ],
  related: ["big-number", "exponent", "rounding"],
};
