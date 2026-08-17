import { Mountain } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";
import { ceilSafe } from "../format";

const MATERIALS = ["mulch", "gravel", "topsoil", "sand"] as const;

export const mulchGravelSchema = z.object({
  material: selectField(MATERIALS, "Material"),
  length: numberField({ label: "Length (ft)", min: 0.1, max: 10000 }),
  width: numberField({ label: "Width (ft)", min: 0.1, max: 10000 }),
  depthInches: numberField({ label: "Depth (inches)", min: 0.1, max: 60 }),
});

export type MulchGravelValues = z.infer<typeof mulchGravelSchema>;

function calculate(values: MulchGravelValues): CalcResult {
  const depthFt = values.depthInches / 12;
  const cubicFeet = values.length * values.width * depthFt;
  const cubicYards = cubicFeet / 27;

  // Typical bag size is 2 cubic feet for mulch/topsoil/sand, 0.5 cubic feet for gravel bags.
  const bagSize = values.material === "gravel" ? 0.5 : 2;
  const bagsNeeded = ceilSafe(cubicFeet / bagSize);

  return {
    primary: { key: "cubicYards", label: "Volume needed", value: Math.round(cubicYards * 1000) / 1000, format: "number", unit: "cu yd" },
    secondary: [
      { key: "cubicFeet", label: "Cubic feet", value: Math.round(cubicFeet * 100) / 100, format: "number" },
      { key: "bagsNeeded", label: `Bags needed (${bagSize} ft³ each)`, value: bagsNeeded, format: "number" },
    ],
  };
}

export const mulchGravelCalculator: CalculatorDef = {
  id: "mulch-gravel",
  slug: "mulch-gravel",
  title: "Mulch & Gravel Calculator",
  description: "Calculate how much mulch, gravel, topsoil, or sand you need for an area.",
  category: "other",
  icon: Mountain,
  keywords: ["mulch calculator", "gravel calculator", "topsoil calculator", "landscaping"],
  inputs: [
    {
      name: "material",
      label: "Material",
      kind: "select",
      defaultValue: "mulch",
      options: [
        { value: "mulch", label: "Mulch" },
        { value: "gravel", label: "Gravel" },
        { value: "topsoil", label: "Topsoil" },
        { value: "sand", label: "Sand" },
      ],
    },
    { name: "length", label: "Length (ft)", kind: "number", defaultValue: "", step: 0.1, required: true },
    { name: "width", label: "Width (ft)", kind: "number", defaultValue: "", step: 0.1, required: true },
    { name: "depthInches", label: "Depth (inches)", kind: "number", defaultValue: "3", min: 0.1, max: 60, step: 0.5, required: true },
  ],
  schema: mulchGravelSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Volume = Length × Width × Depth. Cubic yards = Cubic feet ÷ 27.",
  explanation: [
    {
      heading: "Recommended depths vary by material",
      body: "Mulch is typically applied 2-4 inches deep, gravel paths 2-3 inches, and topsoil for new beds 6-12 inches — adjust depth to your specific project.",
    },
  ],
  faq: [
    { q: "Why does bag size differ by material?", a: "Gravel is much denser than mulch, so gravel bags are typically sold in smaller volumes (but heavier weights) than mulch bags." },
  ],
  related: ["concrete", "square-footage"],
};
