import { Flame } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";

const ACTIVITIES = [
  "walking", "running", "cycling", "swimming", "yoga", "weight-training",
  "hiking", "dancing", "hiit", "elliptical",
] as const;
const METS: Record<(typeof ACTIVITIES)[number], number> = {
  walking: 3.5,
  running: 9.8,
  cycling: 7.5,
  swimming: 6.0,
  yoga: 2.5,
  "weight-training": 3.5,
  hiking: 6.0,
  dancing: 4.8,
  hiit: 8.0,
  elliptical: 5.0,
};
const UNIT_SYSTEMS = ["metric", "imperial"] as const;

export const caloriesBurnedSchema = z.object({
  activity: selectField(ACTIVITIES, "Activity"),
  unitSystem: selectField(UNIT_SYSTEMS, "Unit system"),
  weight: numberField({ label: "Weight", min: 1, max: 1000 }),
  durationMinutes: numberField({ label: "Duration", min: 1, max: 1440 }),
});

export type CaloriesBurnedValues = z.infer<typeof caloriesBurnedSchema>;

function calculate(values: CaloriesBurnedValues): CalcResult {
  const weightKg = values.unitSystem === "metric" ? values.weight : values.weight * 0.453592;
  const met = METS[values.activity];
  const hours = values.durationMinutes / 60;
  const calories = met * weightKg * hours;

  return {
    primary: { key: "calories", label: "Calories burned", value: Math.round(calories), format: "number", unit: "kcal" },
    secondary: [
      { key: "met", label: "MET value used", value: met, format: "number" },
      { key: "caloriesPerHour", label: "Rate", value: Math.round(met * weightKg), format: "number", unit: "kcal/hour" },
    ],
  };
}

export const caloriesBurnedCalculator: CalculatorDef = {
  id: "calories-burned",
  slug: "calories-burned",
  title: "Calories Burned Calculator",
  description: "Estimate calories burned during an activity using its MET value.",
  category: "health",
  icon: Flame,
  keywords: ["calories burned", "met value", "exercise calories", "workout calories"],
  inputs: [
    {
      name: "activity",
      label: "Activity",
      kind: "select",
      defaultValue: "running",
      options: [
        { value: "walking", label: "Walking (moderate pace)" },
        { value: "running", label: "Running (6 mph)" },
        { value: "cycling", label: "Cycling (moderate)" },
        { value: "swimming", label: "Swimming (moderate)" },
        { value: "yoga", label: "Yoga" },
        { value: "weight-training", label: "Weight training" },
        { value: "hiking", label: "Hiking" },
        { value: "dancing", label: "Dancing" },
        { value: "hiit", label: "HIIT" },
        { value: "elliptical", label: "Elliptical trainer" },
      ],
    },
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
    { name: "weight", label: "Weight", kind: "number", defaultValue: "", step: 0.1, required: true },
    { name: "durationMinutes", label: "Duration (minutes)", kind: "number", defaultValue: "30", min: 1, max: 1440, step: 1, required: true },
  ],
  schema: caloriesBurnedSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  dynamicLabels: (values) => (values.unitSystem === "imperial" ? { weight: "Weight (lb)" } : { weight: "Weight (kg)" }),
  formula: "Calories = MET × weight(kg) × duration(hours). MET (Metabolic Equivalent of Task) values are standardized reference intensities for different activities.",
  explanation: [
    {
      heading: "MET values are averages",
      body: "Actual calorie burn varies with intensity, fitness level, and terrain — treat MET-based estimates as a reasonable approximation, not an exact measurement.",
    },
  ],
  faq: [
    { q: "Why does my weight matter so much?", a: "Heavier bodies burn more calories doing the same activity because more energy is needed to move more mass." },
  ],
  related: ["calorie", "bmr", "target-heart-rate"],
};
