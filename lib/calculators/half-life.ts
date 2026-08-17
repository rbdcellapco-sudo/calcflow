import { Atom } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";

export const halfLifeSchema = z.object({
  initialAmount: numberField({ label: "Initial amount", min: 0 }),
  halfLife: numberField({ label: "Half-life", min: 0.0000001 }),
  elapsedTime: numberField({ label: "Elapsed time", min: 0 }),
});

export type HalfLifeValues = z.infer<typeof halfLifeSchema>;

function calculate(values: HalfLifeValues): CalcResult {
  const { initialAmount, halfLife, elapsedTime } = values;
  const remaining = initialAmount * Math.pow(0.5, elapsedTime / halfLife);
  const decayed = initialAmount - remaining;
  const numHalfLives = elapsedTime / halfLife;

  return {
    primary: { key: "remaining", label: "Amount remaining", value: Math.round(remaining * 1e6) / 1e6, format: "number" },
    secondary: [
      { key: "decayed", label: "Amount decayed", value: Math.round(decayed * 1e6) / 1e6, format: "number" },
      { key: "numHalfLives", label: "Number of half-lives elapsed", value: Math.round(numHalfLives * 1000) / 1000, format: "number" },
    ],
  };
}

export const halfLifeCalculator: CalculatorDef = {
  id: "half-life",
  slug: "half-life",
  title: "Half-Life Calculator",
  description: "Calculate the remaining amount of a substance after radioactive or exponential decay.",
  category: "math",
  icon: Atom,
  keywords: ["half life", "radioactive decay", "exponential decay"],
  inputs: [
    { name: "initialAmount", label: "Initial amount", kind: "number", defaultValue: "", step: 0.01, required: true },
    { name: "halfLife", label: "Half-life", kind: "number", defaultValue: "", step: 0.01, required: true, helpText: "Use the same time unit as elapsed time." },
    { name: "elapsedTime", label: "Elapsed time", kind: "number", defaultValue: "", step: 0.01, required: true },
  ],
  schema: halfLifeSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "N(t) = N₀ × (1/2)^(t ÷ half-life).",
  explanation: [
    {
      heading: "Same math, many applications",
      body: "This exponential decay formula applies to radioactive decay, drug elimination from the body (pharmacokinetics), and any process where a quantity decreases by a constant proportion each period.",
    },
  ],
  faq: [
    { q: "What units should I use?", a: "Any consistent time unit works (seconds, days, years) — just make sure half-life and elapsed time use the same unit." },
  ],
  related: ["exponent", "log"],
};
