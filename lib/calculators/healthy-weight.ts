import { HeartHandshake } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";

const UNIT_SYSTEMS = ["metric", "imperial"] as const;
const GENDERS = ["male", "female"] as const;

export const healthyWeightSchema = z.object({
  unitSystem: selectField(UNIT_SYSTEMS, "Unit system"),
  gender: selectField(GENDERS, "Gender"),
  height: numberField({ label: "Height", min: 1, max: 300 }),
});

export type HealthyWeightValues = z.infer<typeof healthyWeightSchema>;

function calculate(values: HealthyWeightValues): CalcResult {
  const heightCm = values.unitSystem === "metric" ? values.height : values.height * 2.54;
  const heightM = heightCm / 100;
  const heightIn = heightCm / 2.54;

  const minHealthyKg = 18.5 * heightM * heightM;
  const maxHealthyKg = 24.9 * heightM * heightM;

  // Devine formula (ideal body weight)
  const inchesOver5ft = Math.max(0, heightIn - 60);
  const idealKg = values.gender === "male" ? 50 + 2.3 * inchesOver5ft : 45.5 + 2.3 * inchesOver5ft;

  const toDisplay = (kg: number) => (values.unitSystem === "metric" ? kg : kg / 0.453592);
  const unit = values.unitSystem === "metric" ? "kg" : "lb";

  return {
    primary: { key: "idealWeight", label: "Ideal weight (Devine formula)", value: Math.round(toDisplay(idealKg) * 10) / 10, format: "number", unit },
    secondary: [
      { key: "minHealthy", label: "Healthy range (min)", value: Math.round(toDisplay(minHealthyKg) * 10) / 10, format: "number", unit },
      { key: "maxHealthy", label: "Healthy range (max)", value: Math.round(toDisplay(maxHealthyKg) * 10) / 10, format: "number", unit },
    ],
    notes: ["The healthy range is based on a BMI of 18.5-24.9. 'Ideal weight' formulas are older estimates from clinical dosing use and don't account for build or muscle mass."],
  };
}

export const healthyWeightCalculator: CalculatorDef = {
  id: "healthy-weight",
  slug: "healthy-weight",
  title: "Healthy Weight Calculator",
  description: "Find your healthy BMI-based weight range and an ideal weight estimate for your height.",
  category: "health",
  icon: HeartHandshake,
  keywords: ["ideal weight", "healthy weight range", "devine formula", "target weight"],
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
    { name: "height", label: "Height", kind: "number", defaultValue: "", step: 0.1, required: true },
  ],
  schema: healthyWeightSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  dynamicLabels: (values) => (values.unitSystem === "imperial" ? { height: "Height (in)" } : { height: "Height (cm)" }),
  formula: "Healthy range: BMI 18.5-24.9 × height(m)². Ideal weight (Devine): Male = 50kg + 2.3kg per inch over 5ft; Female = 45.5kg + 2.3kg per inch over 5ft.",
  explanation: [
    {
      heading: "A range, not a target",
      body: "A wide range of weights can be perfectly healthy for a given height depending on muscle mass, frame size, and body composition — treat these as reference points, not strict goals.",
    },
  ],
  faq: [
    { q: "Why does the ideal weight formula only need height and gender?", a: "It's a decades-old clinical formula (originally for drug dosing) that predates BMI-based approaches — it doesn't account for frame size or muscle mass." },
  ],
  related: ["bmi", "overweight", "body-fat"],
};
