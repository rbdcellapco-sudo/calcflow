import { Box } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";

const SHAPES = ["cube", "rectangular-prism", "sphere", "cylinder", "cone"] as const;

export const volumeSchema = z.object({
  shape: selectField(SHAPES, "Shape"),
  a: numberField({ label: "Value a", min: 0.0001, max: 1_000_000 }),
  b: numberField({ label: "Value b", min: 0, max: 1_000_000, required: false }),
  c: numberField({ label: "Value c", min: 0, max: 1_000_000, required: false }),
});

export type VolumeValues = z.infer<typeof volumeSchema>;

function calculate(values: VolumeValues): CalcResult {
  const { shape, a, b = 0, c = 0 } = values;
  let volume: number;

  switch (shape) {
    case "cube":
      volume = a ** 3;
      break;
    case "rectangular-prism":
      volume = a * b * c;
      break;
    case "sphere":
      volume = (4 / 3) * Math.PI * a ** 3;
      break;
    case "cylinder":
      volume = Math.PI * a ** 2 * b;
      break;
    case "cone":
      volume = (1 / 3) * Math.PI * a ** 2 * b;
      break;
  }

  return {
    primary: { key: "volume", label: "Volume", value: Math.round(volume * 1000) / 1000, format: "number" },
    secondary: [],
  };
}

export const volumeCalculator: CalculatorDef = {
  id: "volume",
  slug: "volume",
  title: "Volume Calculator",
  description: "Calculate the volume of common 3D shapes: cube, prism, sphere, cylinder, or cone.",
  category: "math",
  icon: Box,
  keywords: ["volume", "sphere volume", "cylinder volume", "cone volume", "cube volume"],
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
  schema: volumeSchema,
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
  formula: "Cube: a³. Prism: l×w×h. Sphere: (4/3)πr³. Cylinder: πr²h. Cone: (1/3)πr²h.",
  explanation: [
    {
      heading: "Volume is cubed units",
      body: "The result is in your input unit cubed (e.g. cm³) — a good sanity check that you've picked the right formula for the shape.",
    },
  ],
  faq: [
    { q: "Need the outer surface instead?", a: "Use the Surface Area Calculator for the total surface area of these same shapes." },
  ],
  related: ["surface-area", "area"],
};
