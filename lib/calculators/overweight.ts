import { Scale3D } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";

const UNIT_SYSTEMS = ["metric", "imperial"] as const;

export const overweightSchema = z.object({
  unitSystem: selectField(UNIT_SYSTEMS, "Unit system"),
  weight: numberField({ label: "Weight", min: 1, max: 1000 }),
  height: numberField({ label: "Height", min: 1, max: 300 }),
});

export type OverweightValues = z.infer<typeof overweightSchema>;

function calculate(values: OverweightValues): CalcResult {
  const weightKg = values.unitSystem === "metric" ? values.weight : values.weight * 0.453592;
  const heightCm = values.unitSystem === "metric" ? values.height : values.height * 2.54;
  const heightM = heightCm / 100;

  const bmi = weightKg / (heightM * heightM);
  const minHealthyKg = 18.5 * heightM * heightM;
  const maxHealthyKg = 24.9 * heightM * heightM;

  const toDisplay = (kg: number) => (values.unitSystem === "metric" ? kg : kg / 0.453592);
  const unit = values.unitSystem === "metric" ? "kg" : "lb";

  let status: string;
  let amount = 0;
  if (bmi < 17.5) {
    status = "Severely underweight";
    amount = minHealthyKg - weightKg;
  } else if (bmi < 18.5) {
    status = "Underweight";
    amount = minHealthyKg - weightKg;
  } else if (bmi <= 24.9) {
    status = "Within healthy range";
    amount = 0;
  } else {
    status = "Overweight";
    amount = weightKg - maxHealthyKg;
  }

  return {
    primary: { key: "status", label: "Weight status", value: status, format: "text" },
    secondary: [
      { key: "bmi", label: "BMI", value: Math.round(bmi * 10) / 10, format: "number" },
      ...(amount > 0
        ? [{ key: "amount", label: bmi > 24.9 ? "Amount over healthy range" : "Amount under healthy range", value: Math.round(toDisplay(amount) * 10) / 10, format: "number" as const, unit }]
        : []),
    ],
    notes: bmi < 17.5 ? ["A BMI below 17.5 is a clinical threshold associated with significant health risk — consider speaking with a healthcare provider."] : undefined,
  };
}

export const overweightCalculator: CalculatorDef = {
  id: "overweight",
  slug: "overweight",
  title: "Overweight Calculator",
  description: "See how far your weight is from a healthy BMI range, in either direction.",
  category: "health",
  icon: Scale3D,
  keywords: ["overweight", "underweight", "how much overweight", "anorexic bmi"],
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
  schema: overweightSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  dynamicLabels: (values) => (values.unitSystem === "imperial" ? { weight: "Weight (lb)", height: "Height (in)" } : { weight: "Weight (kg)", height: "Height (cm)" }),
  formula: "BMI = weight(kg) ÷ height(m)². Amount over/under = weight − nearest healthy-range boundary (BMI 18.5 or 24.9).",
  explanation: [
    {
      heading: "BMI has real limits",
      body: "BMI doesn't distinguish muscle from fat, so athletic or very muscular people are often flagged as 'overweight' despite low body fat. Consider it alongside other measures.",
    },
  ],
  faq: [
    { q: "What does 'severely underweight' mean here?", a: "A BMI below 17.5 is a commonly used clinical reference point associated with health risk, including in the assessment of eating disorders." },
  ],
  related: ["healthy-weight", "bmi", "body-fat"],
};
