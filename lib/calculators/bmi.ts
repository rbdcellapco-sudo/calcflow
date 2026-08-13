import { HeartPulse } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";

const UNIT_SYSTEMS = ["metric", "imperial"] as const;

export const bmiSchema = z.object({
  unitSystem: selectField(UNIT_SYSTEMS, "Unit system"),
  weight: numberField({ label: "Weight", min: 1, max: 1000 }),
  height: numberField({ label: "Height", min: 1, max: 300 }),
});

export type BmiValues = z.infer<typeof bmiSchema>;

export function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal weight";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

function calculate(values: BmiValues): CalcResult {
  const { unitSystem, weight, height } = values;

  let bmi: number;
  if (unitSystem === "metric") {
    const heightM = height / 100;
    bmi = weight / (heightM * heightM);
  } else {
    bmi = (703 * weight) / (height * height);
  }

  const category = bmiCategory(bmi);

  return {
    primary: { key: "bmi", label: "Your BMI", value: bmi, format: "number", unit: "" },
    secondary: [
      { key: "category", label: "Category", value: category, format: "text" },
      {
        key: "healthyRange",
        label: "Healthy BMI range",
        value: "18.5 – 24.9",
        format: "text",
      },
    ],
    notes: [
      "BMI is a screening tool, not a diagnosis. It does not account for muscle mass, bone density, or body composition.",
    ],
  };
}

export const bmiCalculator: CalculatorDef = {
  id: "bmi",
  slug: "bmi",
  title: "BMI Calculator",
  description: "Calculate your Body Mass Index from height and weight, metric or imperial.",
  category: "health",
  icon: HeartPulse,
  keywords: ["body mass index", "weight", "height", "healthy weight"],
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
    { name: "weight", label: "Weight", kind: "number", defaultValue: "", step: 0.1, required: true },
    { name: "height", label: "Height", kind: "number", defaultValue: "", step: 0.1, required: true },
  ],
  schema: bmiSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  dynamicLabels: (values) => {
    if (values.unitSystem === "imperial") {
      return { weight: "Weight (lb)", height: "Height (in)" };
    }
    return { weight: "Weight (kg)", height: "Height (cm)" };
  },
  formula: "Metric: BMI = weight(kg) ÷ height(m)². Imperial: BMI = 703 × weight(lb) ÷ height(in)².",
  explanation: [
    {
      heading: "About BMI",
      body: "Body Mass Index (BMI) is a simple measure of body fat based on height and weight. It applies to most adults but is less accurate for athletes, older adults, and children.",
    },
  ],
  faq: [
    { q: "What is a healthy BMI?", a: "For most adults, a BMI between 18.5 and 24.9 is considered a healthy weight range." },
  ],
  related: ["bmr", "calorie", "ideal-weight"],
};
