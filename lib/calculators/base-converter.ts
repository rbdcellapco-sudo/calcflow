import { Binary } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { selectField } from "../validation";

const BASES = ["2", "8", "10", "16"] as const;
const BASE_LABELS: Record<(typeof BASES)[number], string> = { "2": "Binary", "8": "Octal", "10": "Decimal", "16": "Hexadecimal" };

export const baseConverterSchema = z
  .object({
    fromBase: selectField(BASES, "From base"),
    value: z.string().trim().min(1, "Enter a value"),
  })
  .superRefine((data, ctx) => {
    const base = Number(data.fromBase);
    const validChars = "0123456789abcdefghijklmnopqrstuvwxyz".slice(0, base);
    const normalized = data.value.toLowerCase();
    for (const ch of normalized) {
      if (!validChars.includes(ch)) {
        ctx.addIssue({ code: "custom", path: ["value"], message: `"${data.value}" isn't a valid ${BASE_LABELS[data.fromBase]} number` });
        return;
      }
    }
  });

export type BaseConverterValues = z.infer<typeof baseConverterSchema>;

function calculate(values: BaseConverterValues): CalcResult {
  const base = Number(values.fromBase);
  const decimal = parseInt(values.value, base);
  if (!Number.isFinite(decimal)) throw new Error("Could not parse this value");

  return {
    primary: { key: "decimal", label: "Decimal", value: decimal, format: "number" },
    secondary: [
      { key: "binary", label: "Binary", value: decimal.toString(2), format: "text" },
      { key: "octal", label: "Octal", value: decimal.toString(8), format: "text" },
      { key: "hex", label: "Hexadecimal", value: decimal.toString(16).toUpperCase(), format: "text" },
    ],
  };
}

export const baseConverterCalculator: CalculatorDef = {
  id: "base-converter",
  slug: "base-converter",
  title: "Base Converter (Binary / Hex / Octal)",
  description: "Convert numbers between binary, octal, decimal, and hexadecimal.",
  category: "math",
  icon: Binary,
  keywords: ["binary calculator", "hex calculator", "octal calculator", "number base converter", "base conversion"],
  inputs: [
    {
      name: "fromBase",
      label: "From base",
      kind: "select",
      defaultValue: "10",
      options: [
        { value: "2", label: "Binary (base 2)" },
        { value: "8", label: "Octal (base 8)" },
        { value: "10", label: "Decimal (base 10)" },
        { value: "16", label: "Hexadecimal (base 16)" },
      ],
    },
    { name: "value", label: "Value", kind: "text", defaultValue: "", required: true },
  ],
  schema: baseConverterSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Converts through decimal as a common intermediate: parse the input in its base, then re-express in binary, octal, and hexadecimal.",
  explanation: [
    {
      heading: "Why computers use these bases",
      body: "Binary maps directly to on/off circuit states, while hex and octal are compact human-readable groupings of binary digits (4 bits per hex digit, 3 bits per octal digit).",
    },
  ],
  faq: [
    { q: "Can I enter hex digits like A-F?", a: "Yes, when converting from hexadecimal — use lowercase or uppercase letters A through F for digits 10-15." },
  ],
  related: ["scientific-notation", "big-number"],
};
