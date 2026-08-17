import { Dumbbell } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";

export const oneRepMaxSchema = z.object({
  weightLifted: numberField({ label: "Weight lifted", min: 1, max: 2000 }),
  reps: numberField({ label: "Reps completed", min: 1, max: 20, integer: true }),
});

export type OneRepMaxValues = z.infer<typeof oneRepMaxSchema>;

function calculate(values: OneRepMaxValues): CalcResult {
  const epley = values.weightLifted * (1 + values.reps / 30);
  const brzycki = values.reps < 37 ? (values.weightLifted * 36) / (37 - values.reps) : values.weightLifted;

  const percentTable = [95, 90, 85, 80, 75, 70, 65].map((pct) => ({
    key: `pct${pct}`,
    label: `${pct}% of 1RM`,
    value: Math.round(epley * (pct / 100) * 10) / 10,
    format: "number" as const,
  }));

  return {
    primary: { key: "epley", label: "Estimated 1-rep max (Epley)", value: Math.round(epley * 10) / 10, format: "number" },
    secondary: [
      { key: "brzycki", label: "Estimated 1-rep max (Brzycki)", value: Math.round(brzycki * 10) / 10, format: "number" },
      ...percentTable.slice(0, 3),
    ],
  };
}

export const oneRepMaxCalculator: CalculatorDef = {
  id: "one-rep-max",
  slug: "one-rep-max",
  title: "One Rep Max Calculator",
  description: "Estimate your one-rep max from a weight and rep count using standard strength formulas.",
  category: "health",
  icon: Dumbbell,
  keywords: ["1rm", "one rep max", "epley formula", "brzycki formula", "strength training"],
  inputs: [
    { name: "weightLifted", label: "Weight lifted", kind: "number", defaultValue: "", step: 0.5, required: true },
    { name: "reps", label: "Reps completed", kind: "number", defaultValue: "5", min: 1, max: 20, step: 1, required: true },
  ],
  schema: oneRepMaxSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Epley: 1RM = weight × (1 + reps ÷ 30). Brzycki: 1RM = weight × 36 ÷ (37 − reps).",
  explanation: [
    {
      heading: "Estimates get less reliable at high rep counts",
      body: "These formulas are most accurate for sets of about 1-10 reps. Beyond that, muscular endurance starts to matter more than raw strength, and the estimate drifts.",
    },
  ],
  faq: [
    { q: "Why do Epley and Brzycki give different answers?", a: "They're both empirical approximations fit to different data, so they diverge slightly, especially at higher rep counts — treat the estimate as a range, not an exact number." },
  ],
  related: ["target-heart-rate", "lean-body-mass"],
};
