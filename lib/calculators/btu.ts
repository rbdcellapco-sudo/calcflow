import { Thermometer } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";

const INSULATION_LEVELS = ["poor", "average", "good"] as const;
const INSULATION_FACTOR: Record<(typeof INSULATION_LEVELS)[number], number> = { poor: 40, average: 30, good: 20 };

export const btuSchema = z.object({
  roomLength: numberField({ label: "Room length (ft)", min: 1, max: 1000 }),
  roomWidth: numberField({ label: "Room width (ft)", min: 1, max: 1000 }),
  ceilingHeight: numberField({ label: "Ceiling height (ft)", min: 6, max: 30, required: false }),
  insulation: selectField(INSULATION_LEVELS, "Insulation quality"),
});

export type BtuValues = z.infer<typeof btuSchema>;

function calculate(values: BtuValues): CalcResult {
  const sqFt = values.roomLength * values.roomWidth;
  const ceilingFactor = (values.ceilingHeight ?? 8) / 8;
  const btu = sqFt * INSULATION_FACTOR[values.insulation] * ceilingFactor;

  return {
    primary: { key: "btu", label: "Recommended BTU", value: Math.round(btu / 100) * 100, format: "number", unit: "BTU/hr" },
    secondary: [{ key: "sqFt", label: "Room area", value: Math.round(sqFt * 10) / 10, format: "number", unit: "sq ft" }],
    notes: ["A rough sizing estimate. Sun exposure, number of windows, occupancy, and climate zone all affect actual heating/cooling needs — consult an HVAC professional for a precise load calculation."],
  };
}

export const btuCalculator: CalculatorDef = {
  id: "btu",
  slug: "btu",
  title: "BTU Calculator",
  description: "Estimate the BTU heating or cooling capacity needed for a room.",
  category: "other",
  icon: Thermometer,
  keywords: ["btu calculator", "air conditioner size", "heater size", "hvac sizing"],
  inputs: [
    { name: "roomLength", label: "Room length (ft)", kind: "number", defaultValue: "", step: 0.5, required: true },
    { name: "roomWidth", label: "Room width (ft)", kind: "number", defaultValue: "", step: 0.5, required: true },
    {
      name: "insulation",
      label: "Insulation quality",
      kind: "segmented",
      defaultValue: "average",
      options: [
        { value: "poor", label: "Poor" },
        { value: "average", label: "Average" },
        { value: "good", label: "Good" },
      ],
    },
  ],
  advancedInputs: [
    { name: "ceilingHeight", label: "Ceiling height (ft)", kind: "number", defaultValue: "8", min: 6, max: 30, step: 0.5, required: false },
  ],
  schema: btuSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "BTU ≈ Room area (sq ft) × insulation factor (20-40 BTU/sq ft) × (ceiling height ÷ 8).",
  explanation: [
    {
      heading: "A starting estimate, not a load calculation",
      body: "HVAC professionals use detailed Manual J load calculations accounting for windows, orientation, climate, and occupancy — this gives a reasonable ballpark for casual sizing.",
    },
  ],
  faq: [
    { q: "What insulation level should I pick?", a: "Older homes with single-pane windows and little insulation are 'poor'; newer, well-sealed homes are 'good'; most typical homes fall in 'average'." },
  ],
  related: ["square-footage", "electricity-cost"],
};
