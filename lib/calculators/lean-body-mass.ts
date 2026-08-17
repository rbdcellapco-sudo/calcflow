import { Dumbbell } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";

const UNIT_SYSTEMS = ["metric", "imperial"] as const;
const GENDERS = ["male", "female"] as const;

export const leanBodyMassSchema = z.object({
  unitSystem: selectField(UNIT_SYSTEMS, "Unit system"),
  gender: selectField(GENDERS, "Gender"),
  weight: numberField({ label: "Weight", min: 1, max: 1000 }),
  height: numberField({ label: "Height", min: 1, max: 300 }),
});

export type LeanBodyMassValues = z.infer<typeof leanBodyMassSchema>;

function calculate(values: LeanBodyMassValues): CalcResult {
  const weightKg = values.unitSystem === "metric" ? values.weight : values.weight * 0.453592;
  const heightCm = values.unitSystem === "metric" ? values.height : values.height * 2.54;

  // Boer formula
  const lbmKg = values.gender === "male" ? 0.407 * weightKg + 0.267 * heightCm - 19.2 : 0.252 * weightKg + 0.473 * heightCm - 48.3;
  const fatMassKg = Math.max(weightKg - lbmKg, 0);
  const fatPercent = (fatMassKg / weightKg) * 100;

  const toDisplay = (kg: number) => (values.unitSystem === "metric" ? kg : kg / 0.453592);
  const unit = values.unitSystem === "metric" ? "kg" : "lb";

  return {
    primary: { key: "leanBodyMass", label: "Lean body mass", value: Math.round(toDisplay(lbmKg) * 10) / 10, format: "number", unit },
    secondary: [
      { key: "fatMass", label: "Fat mass", value: Math.round(toDisplay(fatMassKg) * 10) / 10, format: "number", unit },
      { key: "fatPercent", label: "Estimated body fat", value: Math.round(fatPercent * 10) / 10, format: "percentage" },
    ],
    notes: ["Uses the Boer formula, a widely cited estimate. For a more direct measurement, use the Body Fat Calculator's circumference method or a DEXA scan."],
  };
}

export const leanBodyMassCalculator: CalculatorDef = {
  id: "lean-body-mass",
  slug: "lean-body-mass",
  title: "Lean Body Mass Calculator",
  description: "Estimate lean body mass and fat mass from your weight and height.",
  category: "health",
  icon: Dumbbell,
  keywords: ["lean body mass", "lbm", "fat free mass", "boer formula"],
  inputs: [
    {
      name: "unitSystem",
      label: "Units",
      kind: "segmented",
      defaultValue: "metric",
      options: [
        { value: "metric", label: "Metric (kg/cm)" },
        { value: "imperial", label: "Imperial (lb/in)" },
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
    { name: "height", label: "Height", kind: "number", defaultValue: "", step: 0.1, required: true },
  ],
  schema: leanBodyMassSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  dynamicLabels: (values) => (values.unitSystem === "imperial" ? { weight: "Weight (lb)", height: "Height (in)" } : { weight: "Weight (kg)", height: "Height (cm)" }),
  formula: "Boer formula — Male: 0.407×weight(kg) + 0.267×height(cm) − 19.2. Female: 0.252×weight(kg) + 0.473×height(cm) − 48.3.",
  explanation: [
    {
      heading: "Why lean mass matters",
      body: "Lean body mass drives your metabolic rate more than total weight does, which is why two people at the same weight can have very different calorie needs.",
    },
  ],
  faq: [
    { q: "Is this the same as muscle mass?", a: "Not exactly — lean body mass includes muscle, bone, organs, and water, not just muscle tissue." },
  ],
  related: ["body-fat", "bmr", "macro"],
};
