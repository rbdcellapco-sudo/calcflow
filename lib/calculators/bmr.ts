import { Flame } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";

const UNIT_SYSTEMS = ["metric", "imperial"] as const;
const GENDERS = ["male", "female"] as const;

export const bmrSchema = z.object({
  unitSystem: selectField(UNIT_SYSTEMS, "Unit system"),
  gender: selectField(GENDERS, "Gender"),
  age: numberField({ label: "Age", min: 1, max: 120, integer: true }),
  weight: numberField({ label: "Weight", min: 1, max: 1000 }),
  height: numberField({ label: "Height", min: 1, max: 300 }),
});

export type BmrValues = z.infer<typeof bmrSchema>;

function calculate(values: BmrValues): CalcResult {
  const weightKg = values.unitSystem === "metric" ? values.weight : values.weight * 0.453592;
  const heightCm = values.unitSystem === "metric" ? values.height : values.height * 2.54;

  // Mifflin-St Jeor equation
  const base = 10 * weightKg + 6.25 * heightCm - 5 * values.age;
  const bmr = values.gender === "male" ? base + 5 : base - 161;

  return {
    primary: { key: "bmr", label: "Basal metabolic rate", value: Math.round(bmr), format: "number", unit: "kcal/day" },
    secondary: [
      { key: "weightKg", label: "Weight used", value: Math.round(weightKg * 10) / 10, format: "number", unit: "kg" },
      { key: "heightCm", label: "Height used", value: Math.round(heightCm * 10) / 10, format: "number", unit: "cm" },
    ],
    notes: ["BMR is the calories your body burns at complete rest. To estimate total daily calories including activity, use the Calorie Calculator."],
  };
}

export const bmrCalculator: CalculatorDef = {
  id: "bmr",
  slug: "bmr",
  title: "BMR Calculator",
  description: "Calculate your Basal Metabolic Rate — the calories your body burns at rest.",
  category: "health",
  icon: Flame,
  keywords: ["basal metabolic rate", "bmr", "resting calories", "mifflin st jeor"],
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
    { name: "age", label: "Age", kind: "number", defaultValue: "", min: 1, max: 120, step: 1, required: true },
    { name: "weight", label: "Weight", kind: "number", defaultValue: "", step: 0.1, required: true },
    { name: "height", label: "Height", kind: "number", defaultValue: "", step: 0.1, required: true },
  ],
  schema: bmrSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  dynamicLabels: (values) =>
    values.unitSystem === "imperial" ? { weight: "Weight (lb)", height: "Height (in)" } : { weight: "Weight (kg)", height: "Height (cm)" },
  formula: "Mifflin-St Jeor: Male = 10×weight(kg) + 6.25×height(cm) − 5×age + 5. Female = 10×weight(kg) + 6.25×height(cm) − 5×age − 161.",
  explanation: [
    {
      heading: "Why Mifflin-St Jeor",
      body: "This equation is widely considered more accurate than the older Harris-Benedict formula for most adults, and is the formula most commonly recommended by dietitians today.",
    },
  ],
  faq: [
    { q: "Is BMR the same as the calories I should eat?", a: "No — BMR only covers resting energy needs. Multiply by an activity factor (see the Calorie Calculator) to estimate total daily calories." },
  ],
  related: ["calorie", "lean-body-mass", "bmi"],
};
