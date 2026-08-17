import { Box } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";

const SOLVE_FOR = ["density", "mass", "volume"] as const;

export const densitySchema = z.object({
  solveFor: selectField(SOLVE_FOR, "Solve for"),
  mass: numberField({ label: "Mass (kg)", min: 0, required: false }),
  volume: numberField({ label: "Volume (L)", min: 0, required: false }),
  density: numberField({ label: "Density (kg/L)", min: 0, required: false }),
});

export type DensityValues = z.infer<typeof densitySchema>;

function calculate(values: DensityValues): CalcResult {
  const { solveFor, mass, volume, density } = values;

  if (solveFor === "density") {
    if (mass === undefined || volume === undefined) throw new Error("Enter mass and volume");
    if (volume === 0) throw new Error("Volume can't be zero");
    return { primary: { key: "density", label: "Density", value: Math.round((mass / volume) * 1000) / 1000, format: "number", unit: "kg/L" }, secondary: [] };
  }

  if (solveFor === "mass") {
    if (density === undefined || volume === undefined) throw new Error("Enter density and volume");
    return { primary: { key: "mass", label: "Mass", value: Math.round(density * volume * 1000) / 1000, format: "number", unit: "kg" }, secondary: [] };
  }

  if (mass === undefined || density === undefined) throw new Error("Enter mass and density");
  if (density === 0) throw new Error("Density can't be zero");
  return { primary: { key: "volume", label: "Volume", value: Math.round((mass / density) * 1000) / 1000, format: "number", unit: "L" }, secondary: [] };
}

export const densityCalculator: CalculatorDef = {
  id: "density",
  slug: "density",
  title: "Density Calculator",
  description: "Solve for density, mass, or volume using density = mass ÷ volume.",
  category: "other",
  icon: Box,
  keywords: ["density calculator", "mass volume density", "specific gravity"],
  inputs: [
    {
      name: "solveFor",
      label: "Solve for",
      kind: "segmented",
      defaultValue: "density",
      options: [
        { value: "density", label: "Density" },
        { value: "mass", label: "Mass" },
        { value: "volume", label: "Volume" },
      ],
    },
    { name: "mass", label: "Mass (kg)", kind: "number", defaultValue: "", step: 0.001, required: false },
    { name: "volume", label: "Volume (L)", kind: "number", defaultValue: "", step: 0.001, required: false },
    { name: "density", label: "Density (kg/L)", kind: "number", defaultValue: "", step: 0.001, required: false },
  ],
  schema: densitySchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Density = Mass ÷ Volume (kg/L, equivalent to g/mL or g/cm³).",
  explanation: [
    {
      heading: "Note the units",
      body: "This uses kg and liters throughout — 1 kg/L equals 1 g/mL or 1 g/cm³, so results translate directly to those common lab units.",
    },
  ],
  faq: [
    { q: "What's water's density used for reference?", a: "Water is approximately 1 kg/L (1 g/mL) at 4°C, which is why substances denser than water sink and less dense ones float." },
  ],
  related: ["molarity", "unit-converter"],
};
