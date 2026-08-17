import { Baby } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";

const UNIT_SYSTEMS = ["metric", "imperial"] as const;

export const pregnancyWeightGainSchema = z.object({
  unitSystem: selectField(UNIT_SYSTEMS, "Unit system"),
  prePregnancyWeight: numberField({ label: "Pre-pregnancy weight", min: 1, max: 1000 }),
  height: numberField({ label: "Height", min: 1, max: 300 }),
  currentWeek: numberField({ label: "Current week of pregnancy", min: 1, max: 42, integer: true }),
});

export type PregnancyWeightGainValues = z.infer<typeof pregnancyWeightGainSchema>;

// IOM (Institute of Medicine) total recommended gain ranges, in kg, by pre-pregnancy BMI category.
const IOM_RANGES = {
  underweight: { min: 12.5, max: 18, weeklyRate: 0.5 },
  normal: { min: 11.5, max: 16, weeklyRate: 0.4 },
  overweight: { min: 7, max: 11.5, weeklyRate: 0.3 },
  obese: { min: 5, max: 9, weeklyRate: 0.2 },
};

function calculate(values: PregnancyWeightGainValues): CalcResult {
  const weightKg = values.unitSystem === "metric" ? values.prePregnancyWeight : values.prePregnancyWeight * 0.453592;
  const heightCm = values.unitSystem === "metric" ? values.height : values.height * 2.54;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  let category: keyof typeof IOM_RANGES;
  if (bmi < 18.5) category = "underweight";
  else if (bmi < 25) category = "normal";
  else if (bmi < 30) category = "overweight";
  else category = "obese";

  const range = IOM_RANGES[category];
  // First trimester: roughly 1-2 kg total; after that, gain proceeds at the category's weekly rate.
  const weeksAfterFirstTrimester = Math.max(values.currentWeek - 13, 0);
  const estimatedGainKg = Math.min(1.5 + weeksAfterFirstTrimester * range.weeklyRate, range.max);

  const toDisplay = (kg: number) => (values.unitSystem === "metric" ? kg : kg / 0.453592);
  const unit = values.unitSystem === "metric" ? "kg" : "lb";

  return {
    primary: { key: "totalRange", label: "Recommended total gain", value: `${Math.round(toDisplay(range.min))}-${Math.round(toDisplay(range.max))} ${unit}`, format: "text" },
    secondary: [
      { key: "prePregnancyBmi", label: "Pre-pregnancy BMI", value: Math.round(bmi * 10) / 10, format: "number" },
      { key: "category", label: "BMI category", value: category.charAt(0).toUpperCase() + category.slice(1), format: "text" },
      { key: "estimatedGainSoFar", label: `Typical gain by week ${values.currentWeek}`, value: Math.round(toDisplay(estimatedGainKg) * 10) / 10, format: "number", unit },
    ],
    notes: ["Based on Institute of Medicine (IOM) guidelines. Every pregnancy is different — follow your care provider's personalized guidance over general ranges."],
  };
}

export const pregnancyWeightGainCalculator: CalculatorDef = {
  id: "pregnancy-weight-gain",
  slug: "pregnancy-weight-gain",
  title: "Pregnancy Weight Gain Calculator",
  description: "See the recommended pregnancy weight gain range based on your pre-pregnancy BMI.",
  category: "health",
  icon: Baby,
  keywords: ["pregnancy weight gain", "iom guidelines", "healthy pregnancy weight"],
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
    { name: "prePregnancyWeight", label: "Pre-pregnancy weight", kind: "number", defaultValue: "", step: 0.1, required: true },
    { name: "height", label: "Height", kind: "number", defaultValue: "", step: 0.1, required: true },
    { name: "currentWeek", label: "Current week of pregnancy", kind: "number", defaultValue: "20", min: 1, max: 42, step: 1, required: true },
  ],
  schema: pregnancyWeightGainSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  dynamicLabels: (values) => (values.unitSystem === "imperial" ? { prePregnancyWeight: "Pre-pregnancy weight (lb)", height: "Height (in)" } : { prePregnancyWeight: "Pre-pregnancy weight (kg)", height: "Height (cm)" }),
  formula: "IOM total gain ranges by pre-pregnancy BMI: underweight 12.5-18kg, normal 11.5-16kg, overweight 7-11.5kg, obese 5-9kg, with most gain occurring after the first trimester.",
  explanation: [
    {
      heading: "Why pre-pregnancy BMI matters",
      body: "The recommended total weight gain range is lower for people who start pregnancy at a higher BMI and higher for those who start at a lower BMI, since starting energy reserves differ.",
    },
  ],
  faq: [
    { q: "Is gaining outside this range a problem?", a: "Not necessarily for everyone, but gains well outside the recommended range are worth discussing with your care provider, who can account for your individual situation." },
  ],
  related: ["due-date", "bmi"],
};
