import { Move } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";

export const distanceSchema = z.object({
  x1: numberField({ label: "x1" }),
  y1: numberField({ label: "y1" }),
  x2: numberField({ label: "x2" }),
  y2: numberField({ label: "y2" }),
  z1: numberField({ label: "z1", required: false }),
  z2: numberField({ label: "z2", required: false }),
});

export type DistanceValues = z.infer<typeof distanceSchema>;

function calculate(values: DistanceValues): CalcResult {
  const { x1, y1, x2, y2 } = values;
  const z1 = values.z1 ?? 0;
  const z2 = values.z2 ?? 0;
  const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2);
  const midpoint = `(${(x1 + x2) / 2}, ${(y1 + y2) / 2}${values.z1 !== undefined ? `, ${(z1 + z2) / 2}` : ""})`;

  return {
    primary: { key: "distance", label: "Distance", value: Math.round(distance * 1e6) / 1e6, format: "number" },
    secondary: [{ key: "midpoint", label: "Midpoint", value: midpoint, format: "text" }],
  };
}

export const distanceCalculator: CalculatorDef = {
  id: "distance",
  slug: "distance",
  title: "Distance Calculator",
  description: "Find the straight-line distance and midpoint between two points (2D or 3D).",
  category: "math",
  icon: Move,
  keywords: ["distance formula", "distance between two points", "midpoint"],
  inputs: [
    { name: "x1", label: "x1", kind: "number", defaultValue: "", step: 0.01, required: true },
    { name: "y1", label: "y1", kind: "number", defaultValue: "", step: 0.01, required: true },
    { name: "x2", label: "x2", kind: "number", defaultValue: "", step: 0.01, required: true },
    { name: "y2", label: "y2", kind: "number", defaultValue: "", step: 0.01, required: true },
  ],
  advancedInputs: [
    { name: "z1", label: "z1 (for 3D points)", kind: "number", defaultValue: "", step: 0.01, required: false },
    { name: "z2", label: "z2 (for 3D points)", kind: "number", defaultValue: "", step: 0.01, required: false },
  ],
  schema: distanceSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "2D: d = √((x2−x1)² + (y2−y1)²). 3D adds a (z2−z1)² term under the root.",
  explanation: [
    {
      heading: "It's the Pythagorean theorem, extended",
      body: "The distance formula is really just the Pythagorean theorem applied to the horizontal and vertical (and depth, in 3D) differences between two points.",
    },
  ],
  faq: [
    { q: "Do I need to fill in z1 and z2?", a: "Only for 3D points — leave them blank for a standard 2D distance calculation." },
  ],
  related: ["slope", "right-triangle"],
};
