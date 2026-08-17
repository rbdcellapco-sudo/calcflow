import { Disc } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";

export const tireSizeSchema = z.object({
  width: numberField({ label: "Section width (mm)", min: 100, max: 400 }),
  aspectRatio: numberField({ label: "Aspect ratio", min: 20, max: 100 }),
  wheelDiameter: numberField({ label: "Wheel diameter (in)", min: 10, max: 30 }),
});

export type TireSizeValues = z.infer<typeof tireSizeSchema>;

function calculate(values: TireSizeValues): CalcResult {
  const sidewallHeightMm = values.width * (values.aspectRatio / 100);
  const diameterMm = sidewallHeightMm * 2 + values.wheelDiameter * 25.4;
  const diameterIn = diameterMm / 25.4;
  const circumferenceIn = diameterIn * Math.PI;
  const revsPerMile = 63360 / circumferenceIn;

  return {
    primary: { key: "diameter", label: "Overall diameter", value: Math.round(diameterIn * 100) / 100, format: "number", unit: "in" },
    secondary: [
      { key: "circumference", label: "Circumference", value: Math.round(circumferenceIn * 100) / 100, format: "number", unit: "in" },
      { key: "sidewallHeight", label: "Sidewall height", value: Math.round((sidewallHeightMm / 25.4) * 100) / 100, format: "number", unit: "in" },
      { key: "revsPerMile", label: "Revolutions per mile", value: Math.round(revsPerMile), format: "number" },
    ],
  };
}

export const tireSizeCalculator: CalculatorDef = {
  id: "tire-size",
  slug: "tire-size",
  title: "Tire Size Calculator",
  description: "Calculate a tire's overall diameter and circumference from its sidewall spec (e.g. 225/45R17).",
  category: "other",
  icon: Disc,
  keywords: ["tire size calculator", "tire diameter", "tire circumference"],
  inputs: [
    { name: "width", label: "Section width (mm)", kind: "number", defaultValue: "225", min: 100, max: 400, step: 1, required: true },
    { name: "aspectRatio", label: "Aspect ratio", kind: "number", defaultValue: "45", min: 20, max: 100, step: 1, required: true },
    { name: "wheelDiameter", label: "Wheel diameter (in)", kind: "number", defaultValue: "17", min: 10, max: 30, step: 0.5, required: true },
  ],
  schema: tireSizeSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Sidewall height = Width × (aspect ratio ÷ 100). Overall diameter = 2 × sidewall height + wheel diameter.",
  explanation: [
    {
      heading: "Reading a tire size",
      body: "In '225/45R17', 225 is the section width in mm, 45 is the aspect ratio (sidewall height as a % of width), R means radial, and 17 is the wheel diameter in inches.",
    },
  ],
  faq: [
    { q: "Why does tire size matter for speedometer accuracy?", a: "Changing overall tire diameter changes how far your car travels per wheel revolution, which can throw off speedometer and odometer readings if not recalibrated." },
  ],
  related: ["unit-converter"],
};
