import { Droplets } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";

const GENDERS = ["male", "female"] as const;

export const gfrSchema = z.object({
  gender: selectField(GENDERS, "Gender"),
  age: numberField({ label: "Age", min: 18, max: 120, integer: true }),
  creatinine: numberField({ label: "Serum creatinine", min: 0.1, max: 20 }),
});

export type GfrValues = z.infer<typeof gfrSchema>;

function calculate(values: GfrValues): CalcResult {
  const { age, creatinine, gender } = values;
  let egfr: number;

  // 2021 CKD-EPI creatinine equation (race-free)
  if (gender === "female") {
    const k = 0.7;
    const alpha = creatinine <= k ? -0.241 : -1.2;
    egfr = 142 * Math.pow(creatinine / k, alpha) * Math.pow(0.9938, age) * 1.012;
  } else {
    const k = 0.9;
    const alpha = creatinine <= k ? -0.302 : -1.2;
    egfr = 142 * Math.pow(creatinine / k, alpha) * Math.pow(0.9938, age);
  }

  let stage: string;
  if (egfr >= 90) stage = "G1 - Normal or high";
  else if (egfr >= 60) stage = "G2 - Mildly decreased";
  else if (egfr >= 45) stage = "G3a - Mildly to moderately decreased";
  else if (egfr >= 30) stage = "G3b - Moderately to severely decreased";
  else if (egfr >= 15) stage = "G4 - Severely decreased";
  else stage = "G5 - Kidney failure";

  return {
    primary: { key: "egfr", label: "Estimated GFR", value: Math.round(egfr), format: "number", unit: "mL/min/1.73m²" },
    secondary: [{ key: "stage", label: "CKD stage category", value: stage, format: "text" }],
    notes: [
      "Uses the 2021 CKD-EPI creatinine equation (race-free), the current recommended standard. This is for informational purposes only — always rely on your lab's reported eGFR and your doctor's interpretation for medical decisions.",
    ],
  };
}

export const gfrCalculator: CalculatorDef = {
  id: "gfr",
  slug: "gfr",
  title: "GFR Calculator",
  description: "Estimate kidney function (eGFR) from serum creatinine, age, and gender.",
  category: "health",
  icon: Droplets,
  keywords: ["gfr", "egfr", "kidney function", "ckd-epi", "creatinine"],
  inputs: [
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
    { name: "age", label: "Age", kind: "number", defaultValue: "", min: 18, max: 120, step: 1, required: true },
    { name: "creatinine", label: "Serum creatinine (mg/dL)", kind: "number", defaultValue: "", min: 0.1, max: 20, step: 0.01, required: true, helpText: "From a recent blood test." },
  ],
  schema: gfrSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "2021 CKD-EPI creatinine equation: eGFR = 142 × min(Scr/κ, 1)^α × max(Scr/κ, 1)⁻¹·²⁰⁰ × 0.9938^age × (1.012 if female).",
  explanation: [
    {
      heading: "This is not a diagnosis",
      body: "eGFR is one input into assessing kidney function, alongside other lab values, urine tests, and clinical history. A single result should always be interpreted by a healthcare provider.",
    },
  ],
  faq: [
    { q: "Why doesn't this ask for race?", a: "This calculator uses the 2021 CKD-EPI equation, which removed the race coefficient used in older versions, following recommendations from the NKF and ASN Task Force to improve equity in kidney function assessment." },
  ],
  related: ["body-surface-area", "bmi"],
};
