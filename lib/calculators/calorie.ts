import { Utensils } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";

const UNIT_SYSTEMS = ["metric", "imperial"] as const;
const GENDERS = ["male", "female"] as const;
const ACTIVITY_LEVELS = ["sedentary", "light", "moderate", "active", "very-active"] as const;
const ACTIVITY_MULTIPLIERS: Record<(typeof ACTIVITY_LEVELS)[number], number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  "very-active": 1.9,
};

export const calorieSchema = z.object({
  unitSystem: selectField(UNIT_SYSTEMS, "Unit system"),
  gender: selectField(GENDERS, "Gender"),
  age: numberField({ label: "Age", min: 1, max: 120, integer: true }),
  weight: numberField({ label: "Weight", min: 1, max: 1000 }),
  height: numberField({ label: "Height", min: 1, max: 300 }),
  activityLevel: selectField(ACTIVITY_LEVELS, "Activity level"),
});

export type CalorieValues = z.infer<typeof calorieSchema>;

function calculate(values: CalorieValues): CalcResult {
  const weightKg = values.unitSystem === "metric" ? values.weight : values.weight * 0.453592;
  const heightCm = values.unitSystem === "metric" ? values.height : values.height * 2.54;

  const base = 10 * weightKg + 6.25 * heightCm - 5 * values.age;
  const bmr = values.gender === "male" ? base + 5 : base - 161;
  const tdee = bmr * ACTIVITY_MULTIPLIERS[values.activityLevel];

  return {
    primary: { key: "maintain", label: "Maintain weight", value: Math.round(tdee), format: "number", unit: "kcal/day" },
    secondary: [
      { key: "mildLoss", label: "Mild weight loss (0.25 kg/wk)", value: Math.round(tdee - 250), format: "number", unit: "kcal/day" },
      { key: "loss", label: "Weight loss (0.5 kg/wk)", value: Math.round(tdee - 500), format: "number", unit: "kcal/day" },
      { key: "mildGain", label: "Mild weight gain (0.25 kg/wk)", value: Math.round(tdee + 250), format: "number", unit: "kcal/day" },
      { key: "gain", label: "Weight gain (0.5 kg/wk)", value: Math.round(tdee + 500), format: "number", unit: "kcal/day" },
      { key: "bmr", label: "Basal metabolic rate", value: Math.round(bmr), format: "number", unit: "kcal/day" },
    ],
    notes: ["Also known as your TDEE (Total Daily Energy Expenditure). A 500 kcal/day deficit or surplus roughly corresponds to 0.5 kg (about 1 lb) of weight change per week."],
  };
}

export const calorieCalculator: CalculatorDef = {
  id: "calorie",
  slug: "calorie",
  title: "Calorie Calculator",
  description: "Estimate your daily calorie needs (TDEE) to maintain, lose, or gain weight.",
  category: "health",
  icon: Utensils,
  keywords: ["calorie needs", "tdee", "total daily energy expenditure", "maintenance calories"],
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
    {
      name: "activityLevel",
      label: "Activity level",
      kind: "select",
      defaultValue: "moderate",
      options: [
        { value: "sedentary", label: "Sedentary (little/no exercise)" },
        { value: "light", label: "Light (1-3 days/week)" },
        { value: "moderate", label: "Moderate (3-5 days/week)" },
        { value: "active", label: "Active (6-7 days/week)" },
        { value: "very-active", label: "Very active (physical job or 2x/day)" },
      ],
    },
  ],
  schema: calorieSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  dynamicLabels: (values) =>
    values.unitSystem === "imperial" ? { weight: "Weight (lb)", height: "Height (in)" } : { weight: "Weight (kg)", height: "Height (cm)" },
  formula: "TDEE = BMR (Mifflin-St Jeor) × activity multiplier. A ±500 kcal/day adjustment targets roughly ±0.5 kg/week.",
  explanation: [
    {
      heading: "Weight change isn't perfectly linear",
      body: "This estimate assumes a constant calorie balance, but metabolism adapts over time — treat this as a starting point to adjust based on real-world results, not a guarantee.",
    },
  ],
  faq: [
    { q: "What's a safe rate of weight loss?", a: "Many health guidelines suggest 0.5-1 kg (about 1-2 lb) per week as a sustainable pace for most adults." },
  ],
  related: ["bmr", "macro", "calories-burned"],
};
