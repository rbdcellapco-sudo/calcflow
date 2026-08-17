import { HeartPulse } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";

export const targetHeartRateSchema = z.object({
  age: numberField({ label: "Age", min: 1, max: 120, integer: true }),
  restingHeartRate: numberField({ label: "Resting heart rate", min: 30, max: 150, required: false }),
});

export type TargetHeartRateValues = z.infer<typeof targetHeartRateSchema>;

function calculate(values: TargetHeartRateValues): CalcResult {
  const maxHr = 220 - values.age;
  const resting = values.restingHeartRate;

  function zone(lowPct: number, highPct: number): [number, number] {
    if (resting !== undefined) {
      // Karvonen method
      const reserve = maxHr - resting;
      return [Math.round(reserve * lowPct + resting), Math.round(reserve * highPct + resting)];
    }
    return [Math.round(maxHr * lowPct), Math.round(maxHr * highPct)];
  }

  const [modLow, modHigh] = zone(0.5, 0.7);
  const [vigLow, vigHigh] = zone(0.7, 0.85);

  return {
    primary: { key: "maxHr", label: "Maximum heart rate", value: maxHr, format: "number", unit: "bpm" },
    secondary: [
      { key: "moderateZone", label: "Moderate intensity (50-70%)", value: `${modLow}-${modHigh} bpm`, format: "text" },
      { key: "vigorousZone", label: "Vigorous intensity (70-85%)", value: `${vigLow}-${vigHigh} bpm`, format: "text" },
    ],
    notes: resting !== undefined ? ["Zones use the Karvonen method, which factors in your resting heart rate for a more personalized target."] : ["Enter your resting heart rate for a more personalized target using the Karvonen method."],
  };
}

export const targetHeartRateCalculator: CalculatorDef = {
  id: "target-heart-rate",
  slug: "target-heart-rate",
  title: "Target Heart Rate Calculator",
  description: "Find your moderate and vigorous exercise heart rate zones.",
  category: "health",
  icon: HeartPulse,
  keywords: ["target heart rate", "heart rate zones", "karvonen method", "max heart rate"],
  inputs: [
    { name: "age", label: "Age", kind: "number", defaultValue: "", min: 1, max: 120, step: 1, required: true },
  ],
  advancedInputs: [
    { name: "restingHeartRate", label: "Resting heart rate (optional)", kind: "number", defaultValue: "", min: 30, max: 150, step: 1, required: false, helpText: "Measure first thing in the morning, before getting up, for the most accurate value." },
  ],
  schema: targetHeartRateSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Max HR = 220 − age. Karvonen: Target = ((Max HR − Resting HR) × intensity%) + Resting HR.",
  explanation: [
    {
      heading: "220 minus age is a rough rule",
      body: "The 220-age formula is a widely used approximation with real individual variation — a fitness professional can measure your actual max heart rate more precisely if needed.",
    },
  ],
  faq: [
    { q: "What zone should I train in?", a: "Moderate intensity (50-70%) is commonly recommended for general cardiovascular health, while vigorous intensity (70-85%) builds fitness faster but is more demanding." },
  ],
  related: ["calories-burned", "bmr"],
};
