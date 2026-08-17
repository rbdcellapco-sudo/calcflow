import { Gauge } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";

export const horsepowerSchema = z.object({
  weight: numberField({ label: "Vehicle weight (lb)", min: 100, max: 100_000 }),
  quarterMileMph: numberField({ label: "Quarter-mile trap speed (mph)", min: 1, max: 400 }),
});

export type HorsepowerValues = z.infer<typeof horsepowerSchema>;

function calculate(values: HorsepowerValues): CalcResult {
  // Trap-speed method: HP = weight * (mph / 234)^3
  const horsepower = values.weight * Math.pow(values.quarterMileMph / 234, 3);

  return {
    primary: { key: "horsepower", label: "Estimated horsepower", value: Math.round(horsepower), format: "number", unit: "hp" },
    secondary: [],
    notes: ["Estimated using the quarter-mile trap-speed method — actual engine horsepower can vary based on drivetrain losses, aerodynamics, and traction."],
  };
}

export const horsepowerCalculator: CalculatorDef = {
  id: "horsepower",
  slug: "horsepower",
  title: "Horsepower Calculator",
  description: "Estimate engine horsepower from vehicle weight and quarter-mile trap speed.",
  category: "other",
  icon: Gauge,
  keywords: ["horsepower calculator", "engine horsepower", "quarter mile hp", "trap speed"],
  inputs: [
    { name: "weight", label: "Vehicle weight (lb)", kind: "number", defaultValue: "", step: 1, required: true, helpText: "Include driver and fuel for a race-day estimate." },
    { name: "quarterMileMph", label: "Quarter-mile trap speed (mph)", kind: "number", defaultValue: "", step: 0.1, required: true },
  ],
  schema: horsepowerSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "HP = Weight(lb) × (trap speed(mph) ÷ 234)³.",
  explanation: [
    {
      heading: "An estimate, not a dyno reading",
      body: "This empirical formula is widely used in drag racing to estimate power from trap speed, but tires, gearing, and track conditions all introduce variance versus a real dynamometer test.",
    },
  ],
  faq: [
    { q: "What's trap speed?", a: "It's the vehicle's speed measured at the very end of a quarter-mile drag strip run (the '1320 foot' mark)." },
  ],
  related: ["speed", "ohms-law"],
};
