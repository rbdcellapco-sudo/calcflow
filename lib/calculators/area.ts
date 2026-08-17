import { Square } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";

const SHAPES = ["square", "rectangle", "circle", "triangle", "trapezoid", "parallelogram"] as const;

export const areaSchema = z.object({
  shape: selectField(SHAPES, "Shape"),
  a: numberField({ label: "Value a", min: 0.0001, max: 1_000_000 }),
  b: numberField({ label: "Value b", min: 0, max: 1_000_000, required: false }),
  c: numberField({ label: "Value c", min: 0, max: 1_000_000, required: false }),
});

export type AreaValues = z.infer<typeof areaSchema>;

function calculate(values: AreaValues): CalcResult {
  const { shape, a, b = 0, c = 0 } = values;
  let area: number;
  let perimeter: number | null = null;

  switch (shape) {
    case "square":
      area = a * a;
      perimeter = 4 * a;
      break;
    case "rectangle":
      area = a * b;
      perimeter = 2 * (a + b);
      break;
    case "circle":
      area = Math.PI * a * a;
      perimeter = 2 * Math.PI * a;
      break;
    case "triangle":
      area = 0.5 * a * b;
      break;
    case "trapezoid":
      area = 0.5 * (a + b) * c;
      break;
    case "parallelogram":
      area = a * b;
      break;
  }

  return {
    primary: { key: "area", label: "Area", value: Math.round(area * 1000) / 1000, format: "number" },
    secondary: perimeter !== null ? [{ key: "perimeter", label: shape === "circle" ? "Circumference" : "Perimeter", value: Math.round(perimeter * 1000) / 1000, format: "number" }] : [],
  };
}

export const areaCalculator: CalculatorDef = {
  id: "area",
  slug: "area",
  title: "Area Calculator",
  description: "Calculate the area and perimeter of common 2D shapes.",
  category: "math",
  icon: Square,
  keywords: ["area", "circle area", "rectangle area", "triangle area", "perimeter"],
  inputs: [
    {
      name: "shape",
      label: "Shape",
      kind: "select",
      defaultValue: "rectangle",
      options: [
        { value: "square", label: "Square" },
        { value: "rectangle", label: "Rectangle" },
        { value: "circle", label: "Circle" },
        { value: "triangle", label: "Triangle (base × height)" },
        { value: "trapezoid", label: "Trapezoid" },
        { value: "parallelogram", label: "Parallelogram" },
      ],
    },
    { name: "a", label: "Value a", kind: "number", defaultValue: "", step: 0.01, required: true },
    { name: "b", label: "Value b", kind: "number", defaultValue: "", step: 0.01, required: false },
    { name: "c", label: "Value c", kind: "number", defaultValue: "", step: 0.01, required: false },
  ],
  schema: areaSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  dynamicLabels: (values) => {
    switch (values.shape) {
      case "square": return { a: "Side length", b: "Value b", c: "Value c" };
      case "rectangle": return { a: "Length", b: "Width", c: "Value c" };
      case "circle": return { a: "Radius", b: "Value b", c: "Value c" };
      case "triangle": return { a: "Base", b: "Height", c: "Value c" };
      case "trapezoid": return { a: "Base 1", b: "Base 2", c: "Height" };
      case "parallelogram": return { a: "Base", b: "Height", c: "Value c" };
      default: return { a: "Value a", b: "Value b", c: "Value c" };
    }
  },
  formula: "Square: a². Rectangle: a×b. Circle: πr². Triangle: ½×base×height. Trapezoid: ½×(base1+base2)×height. Parallelogram: base×height.",
  explanation: [
    {
      heading: "Same units throughout",
      body: "Make sure all measurements for a shape are in the same unit before entering them — the result will be in that unit squared.",
    },
  ],
  faq: [
    { q: "Need a 3D shape instead?", a: "Use the Volume Calculator or Surface Area Calculator for three-dimensional shapes." },
  ],
  related: ["volume", "surface-area", "triangle"],
};
