import { Triangle as TriangleIcon } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";

const MODES = ["two-legs", "leg-hypotenuse"] as const;

export const rightTriangleSchema = z
  .object({
    mode: selectField(MODES, "Known values"),
    a: numberField({ label: "Leg a", min: 0.0001, max: 1_000_000 }),
    b: numberField({ label: "Leg b / Hypotenuse", min: 0.0001, max: 1_000_000 }),
  })
  .superRefine((data, ctx) => {
    if (data.mode === "leg-hypotenuse" && data.b <= data.a) {
      ctx.addIssue({ code: "custom", path: ["b"], message: "Hypotenuse must be longer than the known leg" });
    }
  });

export type RightTriangleValues = z.infer<typeof rightTriangleSchema>;

function calculate(values: RightTriangleValues): CalcResult {
  const { mode, a, b } = values;
  let legA: number, legB: number, hypotenuse: number;

  if (mode === "two-legs") {
    legA = a;
    legB = b;
    hypotenuse = Math.sqrt(legA ** 2 + legB ** 2);
  } else {
    legA = a;
    hypotenuse = b;
    legB = Math.sqrt(hypotenuse ** 2 - legA ** 2);
  }

  const area = (legA * legB) / 2;
  const perimeter = legA + legB + hypotenuse;
  const angleA = (Math.asin(legA / hypotenuse) * 180) / Math.PI;
  const angleB = 90 - angleA;

  return {
    primary: { key: "hypotenuse", label: "Hypotenuse", value: Math.round(hypotenuse * 1000) / 1000, format: "number" },
    secondary: [
      { key: "legA", label: "Leg a", value: Math.round(legA * 1000) / 1000, format: "number" },
      { key: "legB", label: "Leg b", value: Math.round(legB * 1000) / 1000, format: "number" },
      { key: "area", label: "Area", value: Math.round(area * 1000) / 1000, format: "number" },
      { key: "perimeter", label: "Perimeter", value: Math.round(perimeter * 1000) / 1000, format: "number" },
      { key: "angleA", label: "Angle opposite a", value: Math.round(angleA * 100) / 100, format: "number", unit: "°" },
      { key: "angleB", label: "Angle opposite b", value: Math.round(angleB * 100) / 100, format: "number", unit: "°" },
    ],
  };
}

export const rightTriangleCalculator: CalculatorDef = {
  id: "right-triangle",
  slug: "right-triangle",
  title: "Right Triangle Calculator",
  description: "Solve a right triangle using the Pythagorean theorem from two known sides.",
  category: "math",
  icon: TriangleIcon,
  keywords: ["pythagorean theorem", "right triangle", "hypotenuse calculator", "a squared plus b squared"],
  inputs: [
    {
      name: "mode",
      label: "Known values",
      kind: "segmented",
      defaultValue: "two-legs",
      options: [
        { value: "two-legs", label: "Two legs" },
        { value: "leg-hypotenuse", label: "Leg + hypotenuse" },
      ],
    },
    { name: "a", label: "Leg a", kind: "number", defaultValue: "", step: 0.01, required: true },
    { name: "b", label: "Leg b", kind: "number", defaultValue: "", step: 0.01, required: true },
  ],
  schema: rightTriangleSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  dynamicLabels: (values) => (values.mode === "leg-hypotenuse" ? { b: "Hypotenuse" } : { b: "Leg b" }),
  formula: "Pythagorean theorem: a² + b² = c², where c is the hypotenuse.",
  explanation: [
    {
      heading: "Only works for right triangles",
      body: "This formula requires a 90° angle. For triangles without a right angle, use the general Triangle Calculator instead.",
    },
  ],
  faq: [
    { q: "What's the most common use of this?", a: "Beyond geometry homework, it's widely used in construction (checking square corners), navigation, and physics for finding straight-line distances." },
  ],
  related: ["triangle", "distance", "area"],
};
