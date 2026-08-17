import { Landmark } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { selectField } from "../validation";

const MODES = ["to-roman", "to-number"] as const;

const ROMAN_MAP: [string, number][] = [
  ["M", 1000], ["CM", 900], ["D", 500], ["CD", 400], ["C", 100], ["XC", 90],
  ["L", 50], ["XL", 40], ["X", 10], ["IX", 9], ["V", 5], ["IV", 4], ["I", 1],
];

export const romanNumeralSchema = z
  .object({
    mode: selectField(MODES, "Direction"),
    value: z.string().trim().min(1, "Enter a value"),
  })
  .superRefine((data, ctx) => {
    if (data.mode === "to-roman") {
      const n = Number(data.value);
      if (!Number.isInteger(n) || n < 1 || n > 3999) {
        ctx.addIssue({ code: "custom", path: ["value"], message: "Enter a whole number between 1 and 3999" });
      }
    } else {
      if (!/^[MDCLXVI]+$/i.test(data.value)) {
        ctx.addIssue({ code: "custom", path: ["value"], message: "Enter a valid Roman numeral (letters M, D, C, L, X, V, I only)" });
      }
    }
  });

export type RomanNumeralValues = z.infer<typeof romanNumeralSchema>;

function toRoman(num: number): string {
  let n = num;
  let result = "";
  for (const [symbol, value] of ROMAN_MAP) {
    while (n >= value) {
      result += symbol;
      n -= value;
    }
  }
  return result;
}

function fromRoman(roman: string): number {
  const upper = roman.toUpperCase();
  let total = 0;
  let i = 0;
  while (i < upper.length) {
    const pair = ROMAN_MAP.find(([s]) => s.length === 2 && upper.startsWith(s, i));
    if (pair) {
      total += pair[1];
      i += 2;
      continue;
    }
    const single = ROMAN_MAP.find(([s]) => s.length === 1 && upper[i] === s);
    if (!single) throw new Error(`Invalid Roman numeral character: ${upper[i]}`);
    total += single[1];
    i += 1;
  }
  return total;
}

function calculate(values: RomanNumeralValues): CalcResult {
  if (values.mode === "to-roman") {
    const roman = toRoman(Number(values.value));
    return { primary: { key: "roman", label: "Roman numeral", value: roman, format: "text" }, secondary: [] };
  }
  const num = fromRoman(values.value);
  return { primary: { key: "number", label: "Number", value: num, format: "number" }, secondary: [] };
}

export const romanNumeralCalculator: CalculatorDef = {
  id: "roman-numeral",
  slug: "roman-numeral",
  title: "Roman Numeral Converter",
  description: "Convert between numbers and Roman numerals in either direction.",
  category: "math",
  icon: Landmark,
  keywords: ["roman numerals", "roman numeral converter", "roman numeral to number"],
  inputs: [
    {
      name: "mode",
      label: "Direction",
      kind: "segmented",
      defaultValue: "to-roman",
      options: [
        { value: "to-roman", label: "Number → Roman" },
        { value: "to-number", label: "Roman → Number" },
      ],
    },
    { name: "value", label: "Value", kind: "text", defaultValue: "", required: true },
  ],
  schema: romanNumeralSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  dynamicLabels: (values) => ({ value: values.mode === "to-roman" ? "Number (1-3999)" : "Roman numeral" }),
  formula: "Uses the standard subtractive Roman numeral notation (e.g. 4 = IV, 9 = IX, 40 = XL).",
  explanation: [
    {
      heading: "Why the 3999 limit",
      body: "Standard Roman numerals don't have a symbol beyond M (1000), so without special notation, 3999 (MMMCMXCIX) is the largest cleanly representable number.",
    },
  ],
  faq: [
    { q: "Does this validate malformed Roman numerals?", a: "It parses using standard rules, but doesn't strictly reject non-canonical forms (like IIII instead of IV) — it will still compute a value for them." },
  ],
  related: ["big-number"],
};
