import { Home } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";
import { ceilSafe } from "../format";

export const roofingSchema = z.object({
  length: numberField({ label: "Building length (ft)", min: 0.1, max: 10000 }),
  width: numberField({ label: "Building width (ft)", min: 0.1, max: 10000 }),
  pitch: numberField({ label: "Roof pitch (rise per 12)", min: 0, max: 24 }),
  wastePercent: numberField({ label: "Waste allowance", min: 0, max: 50, required: false }),
});

export type RoofingValues = z.infer<typeof roofingSchema>;

function calculate(values: RoofingValues): CalcResult {
  const footprintSqFt = values.length * values.width;
  // Pitch multiplier accounts for the slope increasing actual roof surface vs. the flat footprint.
  const pitchMultiplier = Math.sqrt(144 + values.pitch ** 2) / 12;
  const roofAreaSqFt = footprintSqFt * pitchMultiplier;
  const waste = (values.wastePercent ?? 10) / 100;
  const roofAreaWithWaste = roofAreaSqFt * (1 + waste);
  const squares = roofAreaWithWaste / 100; // roofing "square" = 100 sq ft

  return {
    primary: { key: "squares", label: "Roofing squares needed", value: ceilSafe(squares * 10) / 10, format: "number" },
    secondary: [
      { key: "footprintSqFt", label: "Building footprint", value: Math.round(footprintSqFt * 100) / 100, format: "number", unit: "sq ft" },
      { key: "roofAreaSqFt", label: "Actual roof area", value: Math.round(roofAreaSqFt * 100) / 100, format: "number", unit: "sq ft" },
    ],
  };
}

export const roofingCalculator: CalculatorDef = {
  id: "roofing",
  slug: "roofing",
  title: "Roofing Calculator",
  description: "Calculate roof surface area and roofing squares needed, accounting for pitch.",
  category: "other",
  icon: Home,
  keywords: ["roofing calculator", "roof squares", "roof pitch", "shingles needed"],
  inputs: [
    { name: "length", label: "Building length (ft)", kind: "number", defaultValue: "", step: 0.1, required: true },
    { name: "width", label: "Building width (ft)", kind: "number", defaultValue: "", step: 0.1, required: true },
    { name: "pitch", label: "Roof pitch (rise per 12\" run)", kind: "number", defaultValue: "6", min: 0, max: 24, step: 0.5, required: true },
  ],
  advancedInputs: [
    { name: "wastePercent", label: "Waste allowance (%)", kind: "percentage", defaultValue: "10", required: false },
  ],
  schema: roofingSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Pitch multiplier = √(144 + pitch²) ÷ 12. Roof area = Footprint × pitch multiplier. 1 roofing square = 100 sq ft.",
  explanation: [
    {
      heading: "Why pitch matters so much",
      body: "A steeper roof has more actual surface area than its footprint suggests — a 12/12 pitch (45°) roof has about 41% more surface area than the flat footprint below it.",
    },
  ],
  faq: [
    { q: "What does '6' pitch mean?", a: "It means the roof rises 6 inches for every 12 inches of horizontal run — commonly written as '6/12' or '6-in-12'." },
  ],
  related: ["concrete", "square-footage"],
};
