import { Ruler } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";

const UNIT_SYSTEMS = ["metric", "imperial"] as const;

export const bodySurfaceAreaSchema = z.object({
  unitSystem: selectField(UNIT_SYSTEMS, "Unit system"),
  weight: numberField({ label: "Weight", min: 1, max: 1000 }),
  height: numberField({ label: "Height", min: 1, max: 300 }),
});

export type BodySurfaceAreaValues = z.infer<typeof bodySurfaceAreaSchema>;

function calculate(values: BodySurfaceAreaValues): CalcResult {
  const weightKg = values.unitSystem === "metric" ? values.weight : values.weight * 0.453592;
  const heightCm = values.unitSystem === "metric" ? values.height : values.height * 2.54;

  const duBois = 0.007184 * Math.pow(weightKg, 0.425) * Math.pow(heightCm, 0.725);
  const mosteller = Math.sqrt((heightCm * weightKg) / 3600);

  return {
    primary: { key: "duBois", label: "Body surface area (DuBois)", value: Math.round(duBois * 100) / 100, format: "number", unit: "m²" },
    secondary: [{ key: "mosteller", label: "Body surface area (Mosteller)", value: Math.round(mosteller * 100) / 100, format: "number", unit: "m²" }],
    notes: ["BSA is often used as a reference for medication dosing — always follow your clinician's calculation and guidance, not this estimate, for medical decisions."],
  };
}

export const bodySurfaceAreaCalculator: CalculatorDef = {
  id: "body-surface-area",
  slug: "body-surface-area",
  title: "Body Surface Area Calculator",
  description: "Calculate body surface area (BSA) using the DuBois and Mosteller formulas.",
  category: "health",
  icon: Ruler,
  keywords: ["bsa", "body surface area", "dubois formula", "mosteller formula"],
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
  schema: bodySurfaceAreaSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  dynamicLabels: (values) => (values.unitSystem === "imperial" ? { weight: "Weight (lb)", height: "Height (in)" } : { weight: "Weight (kg)", height: "Height (cm)" }),
  formula: "DuBois: BSA = 0.007184 × weight(kg)^0.425 × height(cm)^0.725. Mosteller: BSA = √(height(cm) × weight(kg) ÷ 3600).",
  explanation: [
    {
      heading: "Two commonly used formulas",
      body: "DuBois is the older, classically cited formula. Mosteller is simpler to compute and widely used in clinical practice — they typically agree closely.",
    },
  ],
  faq: [
    { q: "What is BSA used for?", a: "Clinically, BSA is used to standardize measurements like cardiac output and medication dosing (especially chemotherapy) across people of different sizes." },
  ],
  related: ["bmi", "lean-body-mass"],
};
