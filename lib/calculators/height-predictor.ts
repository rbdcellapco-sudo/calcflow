import { Ruler } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";

const UNIT_SYSTEMS = ["metric", "imperial"] as const;
const CHILD_GENDERS = ["boy", "girl"] as const;

export const heightPredictorSchema = z.object({
  unitSystem: selectField(UNIT_SYSTEMS, "Unit system"),
  childGender: selectField(CHILD_GENDERS, "Child's gender"),
  motherHeight: numberField({ label: "Mother's height", min: 1, max: 300 }),
  fatherHeight: numberField({ label: "Father's height", min: 1, max: 300 }),
});

export type HeightPredictorValues = z.infer<typeof heightPredictorSchema>;

function calculate(values: HeightPredictorValues): CalcResult {
  const motherCm = values.unitSystem === "metric" ? values.motherHeight : values.motherHeight * 2.54;
  const fatherCm = values.unitSystem === "metric" ? values.fatherHeight : values.fatherHeight * 2.54;

  // Mid-parental height method
  const predictedCm = values.childGender === "boy" ? (motherCm + fatherCm) / 2 + 6.5 : (motherCm + fatherCm) / 2 - 6.5;
  const rangeLowCm = predictedCm - 8.5;
  const rangeHighCm = predictedCm + 8.5;

  const toDisplay = (cm: number) => (values.unitSystem === "metric" ? cm : cm / 2.54);
  const unit = values.unitSystem === "metric" ? "cm" : "in";

  return {
    primary: { key: "predictedHeight", label: "Predicted adult height", value: Math.round(toDisplay(predictedCm) * 10) / 10, format: "number", unit },
    secondary: [
      { key: "rangeLow", label: "Likely range (low)", value: Math.round(toDisplay(rangeLowCm) * 10) / 10, format: "number", unit },
      { key: "rangeHigh", label: "Likely range (high)", value: Math.round(toDisplay(rangeHighCm) * 10) / 10, format: "number", unit },
    ],
    notes: ["Uses the mid-parental height method, a rough statistical estimate. Actual adult height depends on many additional genetic and environmental factors."],
  };
}

export const heightPredictorCalculator: CalculatorDef = {
  id: "height-predictor",
  slug: "height-predictor",
  title: "Height Calculator",
  description: "Estimate a child's future adult height from both parents' heights.",
  category: "health",
  icon: Ruler,
  keywords: ["height predictor", "child height", "mid parental height", "how tall will my child be"],
  inputs: [
    {
      name: "unitSystem",
      label: "Units",
      kind: "segmented",
      defaultValue: "metric",
      options: [
        { value: "metric", label: "Metric (cm)" },
        { value: "imperial", label: "Imperial (in)" },
      ],
    },
    {
      name: "childGender",
      label: "Child's gender",
      kind: "segmented",
      defaultValue: "boy",
      options: [
        { value: "boy", label: "Boy" },
        { value: "girl", label: "Girl" },
      ],
    },
    { name: "motherHeight", label: "Mother's height", kind: "number", defaultValue: "", step: 0.1, required: true },
    { name: "fatherHeight", label: "Father's height", kind: "number", defaultValue: "", step: 0.1, required: true },
  ],
  schema: heightPredictorSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Mid-parental height: Boy = (Mother + Father) ÷ 2 + 6.5cm. Girl = (Mother + Father) ÷ 2 − 6.5cm.",
  explanation: [
    {
      heading: "A statistical estimate, not a prediction",
      body: "About two-thirds of children end up within roughly 8.5cm of this estimate, but nutrition, health, and individual genetics all play a role beyond parental height alone.",
    },
  ],
  faq: [
    { q: "How accurate is this?", a: "It's a widely used clinical rule of thumb, reasonably reliable on average, but not a precise prediction for any individual child." },
  ],
  related: ["bmi"],
};
