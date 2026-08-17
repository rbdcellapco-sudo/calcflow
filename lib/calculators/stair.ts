import { StepForward } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";

export const stairSchema = z.object({
  totalRise: numberField({ label: "Total rise (in)", min: 1, max: 5000 }),
  targetRiseHeight: numberField({ label: "Target riser height (in)", min: 4, max: 12, required: false }),
  treadDepth: numberField({ label: "Tread depth (in)", min: 6, max: 20, required: false }),
});

export type StairValues = z.infer<typeof stairSchema>;

function calculate(values: StairValues): CalcResult {
  const target = values.targetRiseHeight ?? 7.5;
  const numSteps = Math.round(values.totalRise / target);
  const actualRiserHeight = values.totalRise / numSteps;

  const treadDepth = values.treadDepth ?? 10;
  const totalRun = (numSteps - 1) * treadDepth;
  const stringerLength = Math.sqrt(values.totalRise ** 2 + totalRun ** 2);

  return {
    primary: { key: "numSteps", label: "Number of steps", value: numSteps, format: "number" },
    secondary: [
      { key: "actualRiserHeight", label: "Actual riser height", value: Math.round(actualRiserHeight * 100) / 100, format: "number", unit: "in" },
      { key: "totalRun", label: "Total run", value: Math.round(totalRun * 100) / 100, format: "number", unit: "in" },
      { key: "stringerLength", label: "Stringer length", value: Math.round((stringerLength / 12) * 100) / 100, format: "number", unit: "ft" },
    ],
    notes: (actualRiserHeight < 4 || actualRiserHeight > 7.75) ? ["The resulting riser height falls outside the 4-7.75 inch range required by most US residential building codes — adjust the target riser height."] : undefined,
  };
}

export const stairCalculator: CalculatorDef = {
  id: "stair",
  slug: "stair",
  title: "Stair Calculator",
  description: "Calculate the number of steps, riser height, and stringer length for a staircase.",
  category: "other",
  icon: StepForward,
  keywords: ["stair calculator", "stringer length", "riser height", "stair rise and run"],
  inputs: [
    { name: "totalRise", label: "Total rise (in)", kind: "number", defaultValue: "", min: 1, max: 5000, step: 0.25, required: true, helpText: "The full vertical height from bottom floor to top floor." },
  ],
  advancedInputs: [
    { name: "targetRiseHeight", label: "Target riser height (in)", kind: "number", defaultValue: "7.5", min: 4, max: 12, step: 0.25, required: false },
    { name: "treadDepth", label: "Tread depth (in)", kind: "number", defaultValue: "10", min: 6, max: 20, step: 0.25, required: false },
  ],
  schema: stairSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Number of steps = round(Total rise ÷ target riser height). Stringer length = √(rise² + run²), where run = (steps − 1) × tread depth.",
  explanation: [
    {
      heading: "Steps must have equal rise",
      body: "Building codes require consistent riser heights within a small tolerance — this is why the calculator rounds to a whole number of steps and recalculates the exact riser height for consistency.",
    },
  ],
  faq: [
    { q: "What's a comfortable riser height?", a: "US residential code typically requires risers between 4 and 7.75 inches, with 7-7.5 inches being a common comfortable target." },
  ],
  related: ["concrete", "roofing"],
};
