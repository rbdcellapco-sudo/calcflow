import { Flag } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";

export const golfHandicapSchema = z.object({
  score1: numberField({ label: "Round 1 score" }),
  rating1: numberField({ label: "Round 1 course rating" }),
  slope1: numberField({ label: "Round 1 slope rating", min: 55, max: 155 }),
  score2: numberField({ label: "Round 2 score", required: false }),
  rating2: numberField({ label: "Round 2 course rating", required: false }),
  slope2: numberField({ label: "Round 2 slope rating", min: 55, max: 155, required: false }),
  score3: numberField({ label: "Round 3 score", required: false }),
  rating3: numberField({ label: "Round 3 course rating", required: false }),
  slope3: numberField({ label: "Round 3 slope rating", min: 55, max: 155, required: false }),
});

export type GolfHandicapValues = z.infer<typeof golfHandicapSchema>;

function calculate(values: GolfHandicapValues): CalcResult {
  const rounds = [
    { score: values.score1, rating: values.rating1, slope: values.slope1 },
    { score: values.score2, rating: values.rating2, slope: values.slope2 },
    { score: values.score3, rating: values.rating3, slope: values.slope3 },
  ].filter((r): r is { score: number; rating: number; slope: number } => r.score !== undefined && r.rating !== undefined && r.slope !== undefined);

  // Score differential = (Score - Course Rating) × 113 / Slope Rating
  const differentials = rounds.map((r) => ((r.score - r.rating) * 113) / r.slope);
  const bestDifferential = Math.min(...differentials);
  // Simplified handicap index: 96% of the best differential available (USGA uses a table based on number of rounds).
  const handicapIndex = bestDifferential * 0.96;

  return {
    primary: { key: "handicapIndex", label: "Estimated handicap index", value: Math.round(handicapIndex * 10) / 10, format: "number" },
    secondary: [{ key: "roundsUsed", label: "Rounds entered", value: rounds.length, format: "number" }],
    notes: ["A simplified estimate using your best score differential. The official USGA/WHS system uses a more detailed table based on how many rounds you've submitted."],
  };
}

export const golfHandicapCalculator: CalculatorDef = {
  id: "golf-handicap",
  slug: "golf-handicap",
  title: "Golf Handicap Calculator",
  description: "Estimate your golf handicap index from recent round scores.",
  category: "other",
  icon: Flag,
  keywords: ["golf handicap", "handicap index", "usga handicap", "score differential"],
  inputs: [
    { name: "score1", label: "Round 1 score", kind: "number", defaultValue: "", step: 1, required: true },
    { name: "rating1", label: "Round 1 course rating", kind: "number", defaultValue: "", step: 0.1, required: true },
    { name: "slope1", label: "Round 1 slope rating", kind: "number", defaultValue: "113", min: 55, max: 155, step: 1, required: true },
  ],
  advancedInputs: [
    { name: "score2", label: "Round 2 score", kind: "number", defaultValue: "", step: 1, required: false },
    { name: "rating2", label: "Round 2 course rating", kind: "number", defaultValue: "", step: 0.1, required: false },
    { name: "slope2", label: "Round 2 slope rating", kind: "number", defaultValue: "113", min: 55, max: 155, step: 1, required: false },
    { name: "score3", label: "Round 3 score", kind: "number", defaultValue: "", step: 1, required: false },
    { name: "rating3", label: "Round 3 course rating", kind: "number", defaultValue: "", step: 0.1, required: false },
    { name: "slope3", label: "Round 3 slope rating", kind: "number", defaultValue: "113", min: 55, max: 155, step: 1, required: false },
  ],
  schema: golfHandicapSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Score differential = (Score − Course rating) × 113 ÷ Slope rating. Handicap index ≈ 0.96 × best differential.",
  explanation: [
    {
      heading: "Simplified vs. official",
      body: "The official World Handicap System averages your best differentials from up to 20 rounds using a lookup table — this calculator simplifies that to your single best round among those entered.",
    },
  ],
  faq: [
    { q: "What's slope rating?", a: "It measures a course's relative difficulty for a bogey golfer compared to a scratch golfer — 113 is the average/neutral slope rating." },
  ],
  related: ["statistics"],
};
