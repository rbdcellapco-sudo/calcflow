import { Boxes } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";

const SHAPES = ["cube", "rectangular-prism", "sphere", "cylinder", "cone"] as const;

export const surfaceAreaSchema = z.object({
  shape: selectField(SHAPES, "Shape"),
  a: numberField({ label: "Value a", min: 0.0001, max: 1_000_000 }),
  b: numberField({ label: "Value b", min: 0, max: 1_000_000, required: false }),
  c: numberField({ label: "Value c", min: 0, max: 1_000_000, required: false }),
});

export type SurfaceAreaValues = z.infer<typeof surfaceAreaSchema>;

function calculate(values: SurfaceAreaValues): CalcResult {
  const { shape, a, b = 0, c = 0 } = values;
  let surfaceArea: number;

  switch (shape) {
    case "cube":
      surfaceArea = 6 * a ** 2;
      break;
    case "rectangular-prism":
      surfaceArea = 2 * (a * b + b * c + a * c);
      break;
    case "sphere":
      surfaceArea = 4 * Math.PI * a ** 2;
      break;
    case "cylinder":
      surfaceArea = 2 * Math.PI * a * (a + b);
      break;
    case "cone": {
      const slantHeight = Math.sqrt(a ** 2 + b ** 2);
      surfaceArea = Math.PI * a * (a + slantHeight);
      break;
    }
  }

  return {
    primary: { key: "surfaceArea", label: "Surface area", value: Math.round(surfaceArea * 1000) / 1000, format: "number" },
    secondary: [],
  };
}

export const surfaceAreaCalculator: CalculatorDef = {
  id: "surface-area",
  slug: "surface-area",
  title: "Surface Area Calculator",
  description: "Calculate the total surface area of common 3D shapes.",
  category: "math",
  icon: Boxes,
  keywords: ["surface area", "sphere surface area", "cylinder surface area", "cone surface area"],
  inputs: [
    {
      name: "shape",
      label: "Shape",
      kind: "select",
      defaultValue: "cube",
      options: [
        { value: "cube", label: "Cube" },
        { value: "rectangular-prism", label: "Rectangular prism" },
        { value: "sphere", label: "Sphere" },
        { value: "cylinder", label: "Cylinder" },
        { value: "cone", label: "Cone" },
      ],
    },
    { name: "a", label: "Value a", kind: "number", defaultValue: "", step: 0.01, required: true },
    { name: "b", label: "Value b", kind: "number", defaultValue: "", step: 0.01, required: false },
    { name: "c", label: "Value c", kind: "number", defaultValue: "", step: 0.01, required: false },
  ],
  schema: surfaceAreaSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  dynamicLabels: (values) => {
    switch (values.shape) {
      case "cube": return { a: "Side length", b: "Value b", c: "Value c" };
      case "rectangular-prism": return { a: "Length", b: "Width", c: "Height" };
      case "sphere": return { a: "Radius", b: "Value b", c: "Value c" };
      case "cylinder": return { a: "Radius", b: "Height", c: "Value c" };
      case "cone": return { a: "Radius", b: "Height", c: "Value c" };
      default: return { a: "Value a", b: "Value b", c: "Value c" };
    }
  },
  formula: "Cube: 6a². Prism: 2(lw+wh+lh). Sphere: 4πr². Cylinder: 2πr(r+h). Cone: πr(r+slant height), where slant height = √(r²+h²).",
  explanation: [
    {
      heading: "Includes every face",
      body: "This is the total outer surface, including top and bottom where applicable — useful for material estimates like paint, wrapping, or fabric.",
    },
  ],
  faq: [
    { q: "Need the volume instead?", a: "Use the Volume Calculator for the space enclosed by these same shapes." },
  ],
  related: ["volume", "area"],
};
