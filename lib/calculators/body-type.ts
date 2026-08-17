import { PersonStanding } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";

const UNIT_SYSTEMS = ["metric", "imperial"] as const;
const GENDERS = ["male", "female"] as const;

export const bodyTypeSchema = z.object({
  unitSystem: selectField(UNIT_SYSTEMS, "Unit system"),
  gender: selectField(GENDERS, "Gender"),
  height: numberField({ label: "Height", min: 1, max: 300 }),
  wrist: numberField({ label: "Wrist circumference", min: 1, max: 60 }),
});

export type BodyTypeValues = z.infer<typeof bodyTypeSchema>;

function calculate(values: BodyTypeValues): CalcResult {
  const heightCm = values.unitSystem === "metric" ? values.height : values.height * 2.54;
  const wristCm = values.unitSystem === "metric" ? values.wrist : values.wrist * 2.54;
  const ratio = heightCm / wristCm;

  let frame: string;
  if (values.gender === "male") {
    frame = ratio > 10.4 ? "Small frame" : ratio >= 9.6 ? "Medium frame" : "Large frame";
  } else {
    frame = ratio > 11.0 ? "Small frame" : ratio >= 10.1 ? "Medium frame" : "Large frame";
  }

  return {
    primary: { key: "frame", label: "Body frame size", value: frame, format: "text" },
    secondary: [{ key: "ratio", label: "Height-to-wrist ratio", value: Math.round(ratio * 100) / 100, format: "number" }],
    notes: ["Frame size is a rough classification used to adjust 'ideal weight' expectations — it doesn't capture full body composition."],
  };
}

export const bodyTypeCalculator: CalculatorDef = {
  id: "body-type",
  slug: "body-type",
  title: "Body Type Calculator",
  description: "Estimate your body frame size (small, medium, large) from height and wrist circumference.",
  category: "health",
  icon: PersonStanding,
  keywords: ["body frame size", "body type", "somatotype", "bone structure"],
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
    { name: "wrist", label: "Wrist circumference", kind: "number", defaultValue: "", step: 0.1, required: true },
  ],
  schema: bodyTypeSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  dynamicLabels: (values) => (values.unitSystem === "imperial" ? { height: "Height (in)", wrist: "Wrist (in)" } : { height: "Height (cm)", wrist: "Wrist (cm)" }),
  formula: "Frame ratio = Height ÷ Wrist circumference, compared against gender-specific thresholds.",
  explanation: [
    {
      heading: "Not the same as ectomorph/mesomorph/endomorph",
      body: "This calculator estimates skeletal frame size, a simpler and more measurable concept than somatotype classifications, which are more subjective and less standardized.",
    },
  ],
  faq: [
    { q: "How do I measure my wrist?", a: "Measure around the wrist bone (where a watch sits) with a tape measure, keeping it snug but not tight." },
  ],
  related: ["healthy-weight", "body-fat", "lean-body-mass"],
};
