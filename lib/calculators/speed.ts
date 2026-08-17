import { Gauge } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";

const SOLVE_FOR = ["speed", "distance", "time"] as const;

export const speedSchema = z.object({
  solveFor: selectField(SOLVE_FOR, "Solve for"),
  distance: numberField({ label: "Distance (km)", min: 0, required: false }),
  time: numberField({ label: "Time (hours)", min: 0, required: false }),
  speed: numberField({ label: "Speed (km/h)", min: 0, required: false }),
});

export type SpeedValues = z.infer<typeof speedSchema>;

function calculate(values: SpeedValues): CalcResult {
  const { solveFor, distance, time, speed } = values;

  if (solveFor === "speed") {
    if (distance === undefined || time === undefined) throw new Error("Enter distance and time");
    if (time === 0) throw new Error("Time can't be zero");
    return { primary: { key: "speed", label: "Speed", value: Math.round((distance / time) * 1000) / 1000, format: "number", unit: "km/h" }, secondary: [] };
  }

  if (solveFor === "distance") {
    if (speed === undefined || time === undefined) throw new Error("Enter speed and time");
    return { primary: { key: "distance", label: "Distance", value: Math.round(speed * time * 1000) / 1000, format: "number", unit: "km" }, secondary: [] };
  }

  if (distance === undefined || speed === undefined) throw new Error("Enter distance and speed");
  if (speed === 0) throw new Error("Speed can't be zero");
  return { primary: { key: "time", label: "Time", value: Math.round((distance / speed) * 1000) / 1000, format: "number", unit: "hours" }, secondary: [] };
}

export const speedCalculator: CalculatorDef = {
  id: "speed",
  slug: "speed",
  title: "Speed Calculator",
  description: "Solve for speed, distance, or time using speed = distance ÷ time.",
  category: "other",
  icon: Gauge,
  keywords: ["speed calculator", "distance time speed", "average speed"],
  inputs: [
    {
      name: "solveFor",
      label: "Solve for",
      kind: "segmented",
      defaultValue: "speed",
      options: [
        { value: "speed", label: "Speed" },
        { value: "distance", label: "Distance" },
        { value: "time", label: "Time" },
      ],
    },
    { name: "distance", label: "Distance (km)", kind: "number", defaultValue: "", step: 0.01, required: false },
    { name: "time", label: "Time (hours)", kind: "number", defaultValue: "", step: 0.01, required: false },
    { name: "speed", label: "Speed (km/h)", kind: "number", defaultValue: "", step: 0.01, required: false },
  ],
  schema: speedSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Speed = Distance ÷ Time.",
  explanation: [
    {
      heading: "Average, not instantaneous",
      body: "This computes average speed over the full distance and time — it doesn't account for variations in speed along the way.",
    },
  ],
  faq: [
    { q: "Can I use different units?", a: "Yes, as long as you're consistent — e.g. use miles and hours throughout instead of km and hours for a result in mph." },
  ],
  related: ["horsepower", "unit-converter"],
};
