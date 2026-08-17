import { Hammer } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";
import { ceilSafe } from "../format";

export const concreteSchema = z.object({
  length: numberField({ label: "Length (ft)", min: 0.1, max: 10000 }),
  width: numberField({ label: "Width (ft)", min: 0.1, max: 10000 }),
  thicknessInches: numberField({ label: "Thickness (inches)", min: 0.5, max: 60 }),
  bagYield: numberField({ label: "Cubic feet per bag", min: 0.1, max: 5, required: false }),
});

export type ConcreteValues = z.infer<typeof concreteSchema>;

function calculate(values: ConcreteValues): CalcResult {
  const thicknessFt = values.thicknessInches / 12;
  const cubicFeet = values.length * values.width * thicknessFt;
  const cubicYards = cubicFeet / 27;

  const bagYield = values.bagYield ?? 0.6; // typical 60lb bag yields ~0.45 ft³, 80lb ~0.6 ft³
  const bagsNeeded = ceilSafe(cubicFeet / bagYield);

  return {
    primary: { key: "cubicYards", label: "Concrete needed", value: Math.round(cubicYards * 1000) / 1000, format: "number", unit: "cu yd" },
    secondary: [
      { key: "cubicFeet", label: "Cubic feet", value: Math.round(cubicFeet * 100) / 100, format: "number" },
      { key: "bagsNeeded", label: `Bags needed (${bagYield} ft³ each)`, value: bagsNeeded, format: "number" },
    ],
  };
}

export const concreteCalculator: CalculatorDef = {
  id: "concrete",
  slug: "concrete",
  title: "Concrete Calculator",
  description: "Calculate how much concrete you need for a slab, in cubic yards and bags.",
  category: "other",
  icon: Hammer,
  keywords: ["concrete calculator", "concrete slab", "cubic yards concrete", "concrete bags"],
  inputs: [
    { name: "length", label: "Length (ft)", kind: "number", defaultValue: "", step: 0.1, required: true },
    { name: "width", label: "Width (ft)", kind: "number", defaultValue: "", step: 0.1, required: true },
    { name: "thicknessInches", label: "Thickness (inches)", kind: "number", defaultValue: "4", min: 0.5, max: 60, step: 0.5, required: true },
  ],
  advancedInputs: [
    { name: "bagYield", label: "Cubic feet per bag", kind: "number", defaultValue: "0.6", min: 0.1, max: 5, step: 0.05, required: false, helpText: "A standard 80lb bag yields about 0.6 ft³; a 60lb bag yields about 0.45 ft³." },
  ],
  schema: concreteSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Volume = Length × Width × Thickness. Cubic yards = Cubic feet ÷ 27.",
  explanation: [
    {
      heading: "Order a little extra",
      body: "Most contractors recommend ordering 5-10% more concrete than the calculated amount to account for spillage, uneven subgrade, and measurement variance.",
    },
  ],
  faq: [
    { q: "Should I use ready-mix or bagged concrete?", a: "Ready-mix delivery is usually more economical for large pours (roughly 1+ cubic yard), while bagged concrete is more practical for small jobs." },
  ],
  related: ["square-footage", "roofing"],
};
