import { TrendingUp } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";

export const slopeSchema = z
  .object({
    x1: numberField({ label: "x1" }),
    y1: numberField({ label: "y1" }),
    x2: numberField({ label: "x2" }),
    y2: numberField({ label: "y2" }),
  })
  .superRefine((data, ctx) => {
    if (data.x1 === data.x2) {
      ctx.addIssue({ code: "custom", path: ["x2"], message: "x2 can't equal x1 (the line would be vertical, with undefined slope)" });
    }
  });

export type SlopeValues = z.infer<typeof slopeSchema>;

function calculate(values: SlopeValues): CalcResult {
  const { x1, y1, x2, y2 } = values;
  const slope = (y2 - y1) / (x2 - x1);
  const yIntercept = y1 - slope * x1;
  const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

  const equation = `y = ${Math.round(slope * 1000) / 1000}x ${yIntercept >= 0 ? "+" : "−"} ${Math.round(Math.abs(yIntercept) * 1000) / 1000}`;

  return {
    primary: { key: "slope", label: "Slope (m)", value: Math.round(slope * 10000) / 10000, format: "number" },
    secondary: [
      { key: "equation", label: "Line equation", value: equation, format: "text" },
      { key: "distance", label: "Distance between points", value: Math.round(distance * 1000) / 1000, format: "number" },
    ],
  };
}

export const slopeCalculator: CalculatorDef = {
  id: "slope",
  slug: "slope",
  title: "Slope Calculator",
  description: "Find the slope and equation of a line through two points.",
  category: "math",
  icon: TrendingUp,
  keywords: ["slope", "rise over run", "line equation", "gradient"],
  inputs: [
    { name: "x1", label: "x1", kind: "number", defaultValue: "", step: 0.01, required: true },
    { name: "y1", label: "y1", kind: "number", defaultValue: "", step: 0.01, required: true },
    { name: "x2", label: "x2", kind: "number", defaultValue: "", step: 0.01, required: true },
    { name: "y2", label: "y2", kind: "number", defaultValue: "", step: 0.01, required: true },
  ],
  schema: slopeSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Slope m = (y2 − y1) ÷ (x2 − x1). Line equation: y = mx + b, where b = y1 − m×x1.",
  explanation: [
    {
      heading: "Reading the slope",
      body: "A positive slope rises left to right, negative falls, zero is flat (horizontal), and an undefined slope (x1 = x2) means a vertical line.",
    },
  ],
  faq: [
    { q: "What does 'rise over run' mean?", a: "It's another name for slope — the vertical change (rise) divided by the horizontal change (run) between two points." },
  ],
  related: ["distance", "right-triangle"],
};
