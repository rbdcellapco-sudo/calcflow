import { Shuffle } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";

export const permutationCombinationSchema = z
  .object({
    n: numberField({ label: "n (total items)", min: 0, max: 170, integer: true }),
    r: numberField({ label: "r (items chosen)", min: 0, max: 170, integer: true }),
  })
  .superRefine((data, ctx) => {
    if (data.r > data.n) {
      ctx.addIssue({ code: "custom", path: ["r"], message: "r can't be greater than n" });
    }
  });

export type PermutationCombinationValues = z.infer<typeof permutationCombinationSchema>;

function factorial(n: number): number {
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

function calculate(values: PermutationCombinationValues): CalcResult {
  const { n, r } = values;
  const nPr = factorial(n) / factorial(n - r);
  const nCr = nPr / factorial(r);

  if (!Number.isFinite(nPr) || !Number.isFinite(nCr)) {
    throw new Error("n is too large — try a smaller value");
  }

  return {
    primary: { key: "combinations", label: `${n}C${r} — combinations`, value: Math.round(nCr), format: "number" },
    secondary: [{ key: "permutations", label: `${n}P${r} — permutations`, value: Math.round(nPr), format: "number" }],
  };
}

export const permutationCombinationCalculator: CalculatorDef = {
  id: "permutation-combination",
  slug: "permutation-combination",
  title: "Permutation and Combination Calculator",
  description: "Calculate nPr (permutations) and nCr (combinations) for choosing r items from n.",
  category: "math",
  icon: Shuffle,
  keywords: ["permutation", "combination", "npr", "ncr", "n choose r"],
  inputs: [
    { name: "n", label: "n (total items)", kind: "number", defaultValue: "", min: 0, max: 170, step: 1, required: true },
    { name: "r", label: "r (items chosen)", kind: "number", defaultValue: "", min: 0, max: 170, step: 1, required: true },
  ],
  schema: permutationCombinationSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Permutations: nPr = n! ÷ (n−r)!. Combinations: nCr = n! ÷ (r!(n−r)!).",
  explanation: [
    {
      heading: "Order matters, or it doesn't",
      body: "Permutations count arrangements where order matters (like race finish positions). Combinations count selections where order doesn't matter (like choosing a team) — combinations are always smaller or equal.",
    },
  ],
  faq: [
    { q: "What's a real example of combinations?", a: "Choosing 6 lottery numbers from 49 is a combination problem (nCr), since the order you pick them doesn't matter — only which numbers you end up with." },
  ],
  related: ["probability", "statistics"],
};
