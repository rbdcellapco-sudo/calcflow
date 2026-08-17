import { Wine } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";

const UNIT_SYSTEMS = ["metric", "imperial"] as const;
const GENDERS = ["male", "female"] as const;
const DISTRIBUTION_RATIO: Record<(typeof GENDERS)[number], number> = { male: 0.68, female: 0.55 };

export const bacSchema = z.object({
  unitSystem: selectField(UNIT_SYSTEMS, "Unit system"),
  gender: selectField(GENDERS, "Gender"),
  weight: numberField({ label: "Weight", min: 1, max: 1000 }),
  standardDrinks: numberField({ label: "Standard drinks consumed", min: 0, max: 50 }),
  hoursElapsed: numberField({ label: "Hours since first drink", min: 0, max: 48 }),
});

export type BacValues = z.infer<typeof bacSchema>;

function calculate(values: BacValues): CalcResult {
  const weightKg = values.unitSystem === "metric" ? values.weight : values.weight * 0.453592;
  const alcoholGrams = values.standardDrinks * 14; // US standard drink = 14g pure alcohol
  const r = DISTRIBUTION_RATIO[values.gender];

  const rawBac = (alcoholGrams / (weightKg * 1000 * r)) * 100 - 0.015 * values.hoursElapsed;
  const bac = Math.max(rawBac, 0);

  let guidance: string;
  if (bac === 0) guidance = "Estimated at or below zero.";
  else if (bac < 0.04) guidance = "Impairment may still occur even at low levels.";
  else if (bac < 0.08) guidance = "Legally impaired to drive in many jurisdictions at this level.";
  else guidance = "Significantly impaired at this level in virtually all jurisdictions.";

  return {
    primary: { key: "bac", label: "Estimated BAC", value: Math.round(bac * 1000) / 1000, format: "percentage" },
    secondary: [{ key: "alcoholGrams", label: "Alcohol consumed", value: alcoholGrams, format: "number", unit: "g" }],
    notes: [
      guidance,
      "This is a rough estimate only. Never use it to decide whether it's safe to drive — actual BAC varies with food intake, metabolism, medication, and other factors. When in doubt, don't drive.",
    ],
  };
}

export const bacCalculator: CalculatorDef = {
  id: "bac",
  slug: "bac",
  title: "BAC Calculator",
  description: "Estimate blood alcohol content from drinks consumed, body weight, and time elapsed.",
  category: "health",
  icon: Wine,
  keywords: ["bac", "blood alcohol content", "widmark formula", "alcohol calculator"],
  inputs: [
    {
      name: "unitSystem",
      label: "Units",
      kind: "segmented",
      defaultValue: "metric",
      options: [
        { value: "metric", label: "Metric (kg)" },
        { value: "imperial", label: "Imperial (lb)" },
      ],
    },
    {
      name: "gender",
      label: "Gender",
      kind: "segmented",
      defaultValue: "male",
      options: [
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
      ],
    },
    { name: "weight", label: "Weight", kind: "number", defaultValue: "", step: 0.1, required: true },
    { name: "standardDrinks", label: "Standard drinks consumed", kind: "number", defaultValue: "", min: 0, max: 50, step: 0.5, required: true, helpText: "1 standard US drink ≈ 14g alcohol (a 12oz beer, 5oz wine, or 1.5oz spirits)." },
    { name: "hoursElapsed", label: "Hours since first drink", kind: "number", defaultValue: "1", min: 0, max: 48, step: 0.5, required: true },
  ],
  schema: bacSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  dynamicLabels: (values) => (values.unitSystem === "imperial" ? { weight: "Weight (lb)" } : { weight: "Weight (kg)" }),
  formula: "Widmark formula: BAC% = (Alcohol grams ÷ (Weight(kg) × 1000 × r)) × 100 − 0.015 × hours elapsed, where r is a sex-based body water distribution ratio.",
  explanation: [
    {
      heading: "Individual variation is significant",
      body: "The Widmark formula is a population-average estimate. Actual BAC is affected by food, medications, liver function, and other factors that can shift results meaningfully from person to person.",
    },
  ],
  faq: [
    { q: "Can I use this to decide if I'm okay to drive?", a: "No. This is an estimate for educational purposes only — never use it to make decisions about driving or other activities requiring sobriety." },
  ],
  related: ["calories-burned"],
};
