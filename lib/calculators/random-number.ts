import { Dice5 } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";

const DUPLICATE_MODES = ["allow", "unique"] as const;

export const randomNumberSchema = z
  .object({
    min: numberField({ label: "Minimum", integer: true }),
    max: numberField({ label: "Maximum", integer: true }),
    count: numberField({ label: "How many numbers", min: 1, max: 100, integer: true }),
    duplicates: selectField(DUPLICATE_MODES, "Duplicates"),
  })
  .superRefine((data, ctx) => {
    if (data.min >= data.max) {
      ctx.addIssue({ code: "custom", path: ["max"], message: "Maximum must be greater than minimum" });
    }
    if (data.duplicates === "unique" && data.count > data.max - data.min + 1) {
      ctx.addIssue({ code: "custom", path: ["count"], message: "Not enough unique numbers in this range" });
    }
  });

export type RandomNumberValues = z.infer<typeof randomNumberSchema>;

function calculate(values: RandomNumberValues): CalcResult {
  const { min, max, count, duplicates } = values;
  const results: number[] = [];

  if (duplicates === "unique") {
    const pool = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    results.push(...pool.slice(0, count));
  } else {
    for (let i = 0; i < count; i++) {
      results.push(min + Math.floor(Math.random() * (max - min + 1)));
    }
  }

  return {
    primary: { key: "numbers", label: count === 1 ? "Random number" : "Random numbers", value: results.join(", "), format: "text" },
    secondary: [],
  };
}

export const randomNumberCalculator: CalculatorDef = {
  id: "random-number",
  slug: "random-number",
  title: "Random Number Generator",
  description: "Generate one or more random integers within a range.",
  category: "math",
  icon: Dice5,
  keywords: ["random number generator", "rng", "random integer"],
  inputs: [
    { name: "min", label: "Minimum", kind: "number", defaultValue: "1", step: 1, required: true },
    { name: "max", label: "Maximum", kind: "number", defaultValue: "100", step: 1, required: true },
    { name: "count", label: "How many numbers", kind: "number", defaultValue: "1", min: 1, max: 100, step: 1, required: true },
  ],
  advancedInputs: [
    {
      name: "duplicates",
      label: "Duplicates",
      kind: "segmented",
      defaultValue: "allow",
      options: [
        { value: "allow", label: "Allow duplicates" },
        { value: "unique", label: "No duplicates" },
      ],
    },
  ],
  schema: randomNumberSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Each number is drawn uniformly at random from the integers between minimum and maximum, inclusive.",
  explanation: [
    {
      heading: "Recalculate for a new draw",
      body: "Every time you hit Calculate, a fresh random result is generated — the same inputs will give a different outcome each time.",
    },
  ],
  faq: [
    { q: "Is this good enough for security purposes?", a: "No — this uses standard (not cryptographically secure) randomness, suitable for games, raffles, and everyday decisions, not for security-sensitive applications." },
  ],
  related: ["dice-roller", "permutation-combination"],
};
