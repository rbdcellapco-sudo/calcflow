import { LayoutGrid } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";

export const squareFootageSchema = z.object({
  length1: numberField({ label: "Room 1 length (ft)", min: 0.1, max: 10000 }),
  width1: numberField({ label: "Room 1 width (ft)", min: 0.1, max: 10000 }),
  length2: numberField({ label: "Room 2 length (ft)", min: 0, max: 10000, required: false }),
  width2: numberField({ label: "Room 2 width (ft)", min: 0, max: 10000, required: false }),
  length3: numberField({ label: "Room 3 length (ft)", min: 0, max: 10000, required: false }),
  width3: numberField({ label: "Room 3 width (ft)", min: 0, max: 10000, required: false }),
  pricePerSqFt: numberField({ label: "Price per sq ft", min: 0, required: false }),
});

export type SquareFootageValues = z.infer<typeof squareFootageSchema>;

function calculate(values: SquareFootageValues): CalcResult {
  const rooms = [
    values.length1 * values.width1,
    (values.length2 ?? 0) * (values.width2 ?? 0),
    (values.length3 ?? 0) * (values.width3 ?? 0),
  ];
  const totalSqFt = rooms.reduce((a, b) => a + b, 0);

  const secondary = [
    { key: "roomCount", label: "Rooms included", value: rooms.filter((r) => r > 0).length, format: "number" as const },
  ];

  if (values.pricePerSqFt) {
    secondary.push({ key: "totalCost", label: "Total cost", value: Math.round(totalSqFt * values.pricePerSqFt * 100) / 100, format: "number" as const });
  }

  return {
    primary: { key: "totalSqFt", label: "Total square footage", value: Math.round(totalSqFt * 100) / 100, format: "number", unit: "sq ft" },
    secondary,
  };
}

export const squareFootageCalculator: CalculatorDef = {
  id: "square-footage",
  slug: "square-footage",
  title: "Square Footage Calculator",
  description: "Calculate total square footage across multiple rooms, and total material cost.",
  category: "other",
  icon: LayoutGrid,
  keywords: ["square footage", "square feet calculator", "room area", "flooring calculator"],
  inputs: [
    { name: "length1", label: "Room 1 length (ft)", kind: "number", defaultValue: "", step: 0.1, required: true },
    { name: "width1", label: "Room 1 width (ft)", kind: "number", defaultValue: "", step: 0.1, required: true },
  ],
  advancedInputs: [
    { name: "length2", label: "Room 2 length (ft)", kind: "number", defaultValue: "", step: 0.1, required: false },
    { name: "width2", label: "Room 2 width (ft)", kind: "number", defaultValue: "", step: 0.1, required: false },
    { name: "length3", label: "Room 3 length (ft)", kind: "number", defaultValue: "", step: 0.1, required: false },
    { name: "width3", label: "Room 3 width (ft)", kind: "number", defaultValue: "", step: 0.1, required: false },
    { name: "pricePerSqFt", label: "Price per sq ft (optional)", kind: "currency", defaultValue: "", required: false },
  ],
  schema: squareFootageSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Square footage = Length × Width, summed across every room entered.",
  explanation: [
    {
      heading: "Measure the actual usable space",
      body: "For flooring or paint estimates, measure wall-to-wall and don't subtract small features like closets unless you're specifically excluding them from the job.",
    },
  ],
  faq: [
    { q: "What if I have irregularly shaped rooms?", a: "Break the space into rectangles and enter each as a separate 'room' — the total still sums correctly." },
  ],
  related: ["area", "tile", "concrete"],
};
