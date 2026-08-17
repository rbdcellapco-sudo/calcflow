import { Percent } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";

const UNIT_SYSTEMS = ["metric", "imperial"] as const;
const GENDERS = ["male", "female"] as const;

export const bodyFatSchema = z
  .object({
    unitSystem: selectField(UNIT_SYSTEMS, "Unit system"),
    gender: selectField(GENDERS, "Gender"),
    height: numberField({ label: "Height", min: 1, max: 300 }),
    neck: numberField({ label: "Neck circumference", min: 1, max: 200 }),
    waist: numberField({ label: "Waist circumference", min: 1, max: 300 }),
    hip: numberField({ label: "Hip circumference", min: 0, max: 300, required: false }),
  })
  .superRefine((data, ctx) => {
    if (data.gender === "female" && !data.hip) {
      ctx.addIssue({ code: "custom", path: ["hip"], message: "Hip circumference is required for the female formula" });
    }
    if (data.waist <= data.neck) {
      ctx.addIssue({ code: "custom", path: ["waist"], message: "Waist must be greater than neck circumference" });
    }
  });

export type BodyFatValues = z.infer<typeof bodyFatSchema>;

function calculate(values: BodyFatValues): CalcResult {
  const toCm = (v: number) => (values.unitSystem === "metric" ? v : v * 2.54);
  const height = toCm(values.height);
  const neck = toCm(values.neck);
  const waist = toCm(values.waist);
  const hip = toCm(values.hip ?? 0);

  let bodyFatPercent: number;
  if (values.gender === "male") {
    bodyFatPercent = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
  } else {
    bodyFatPercent = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.221 * Math.log10(height)) - 450;
  }

  let category: string;
  if (values.gender === "male") {
    if (bodyFatPercent < 6) category = "Essential fat";
    else if (bodyFatPercent < 14) category = "Athletic";
    else if (bodyFatPercent < 18) category = "Fitness";
    else if (bodyFatPercent < 25) category = "Average";
    else category = "Above average";
  } else {
    if (bodyFatPercent < 14) category = "Essential fat";
    else if (bodyFatPercent < 21) category = "Athletic";
    else if (bodyFatPercent < 25) category = "Fitness";
    else if (bodyFatPercent < 32) category = "Average";
    else category = "Above average";
  }

  return {
    primary: { key: "bodyFatPercent", label: "Estimated body fat", value: Math.round(bodyFatPercent * 10) / 10, format: "percentage" },
    secondary: [{ key: "category", label: "Category", value: category, format: "text" }],
    notes: ["Uses the circumference method (the same formula used by both the US Navy and US Army for body composition assessment). It's an estimate — DEXA or hydrostatic weighing are more precise."],
  };
}

export const bodyFatCalculator: CalculatorDef = {
  id: "body-fat",
  slug: "body-fat",
  title: "Body Fat Calculator",
  description: "Estimate body fat percentage from waist, neck, and height circumference measurements.",
  category: "health",
  icon: Percent,
  keywords: ["body fat percentage", "navy method", "army body fat", "circumference method"],
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
    { name: "neck", label: "Neck circumference", kind: "number", defaultValue: "", step: 0.1, required: true },
    { name: "waist", label: "Waist circumference", kind: "number", defaultValue: "", step: 0.1, required: true },
  ],
  advancedInputs: [
    { name: "hip", label: "Hip circumference (women only)", kind: "number", defaultValue: "", step: 0.1, required: false },
  ],
  schema: bodyFatSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  dynamicLabels: (values) => (values.unitSystem === "imperial" ? { height: "Height (in)", neck: "Neck (in)", waist: "Waist (in)", hip: "Hip (in)" } : { height: "Height (cm)", neck: "Neck (cm)", waist: "Waist (cm)", hip: "Hip (cm)" }),
  formula: "Male: 495 ÷ (1.0324 − 0.19077×log₁₀(waist−neck) + 0.15456×log₁₀(height)) − 450. Female adds hip circumference with different constants.",
  explanation: [
    {
      heading: "Measurement matters",
      body: "Measure waist at the navel, neck just below the larynx, and hip (for women) at the widest point — inconsistent measurement technique is the biggest source of error in this method.",
    },
  ],
  faq: [
    { q: "How accurate is this method?", a: "The circumference method is typically within a few percentage points of more precise methods like DEXA scans for most people, making it a reasonable field estimate." },
  ],
  related: ["bmi", "lean-body-mass", "body-type"],
};
