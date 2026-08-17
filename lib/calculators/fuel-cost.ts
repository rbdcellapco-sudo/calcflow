import { Fuel } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";

export const fuelCostSchema = z.object({
  distance: numberField({ label: "Trip distance (miles)", min: 0, max: 100000 }),
  fuelEfficiency: numberField({ label: "Fuel efficiency (mpg)", min: 0.1, max: 500 }),
  fuelPrice: numberField({ label: "Fuel price (per gallon)", min: 0, max: 100 }),
});

export type FuelCostValues = z.infer<typeof fuelCostSchema>;

function calculate(values: FuelCostValues): CalcResult {
  const gallonsNeeded = values.distance / values.fuelEfficiency;
  const totalCost = gallonsNeeded * values.fuelPrice;

  return {
    primary: { key: "totalCost", label: "Total fuel cost", value: Math.round(totalCost * 100) / 100, format: "currency" },
    secondary: [{ key: "gallonsNeeded", label: "Fuel needed", value: Math.round(gallonsNeeded * 100) / 100, format: "number", unit: "gal" }],
  };
}

export const fuelCostCalculator: CalculatorDef = {
  id: "fuel-cost",
  slug: "fuel-cost",
  title: "Fuel Cost Calculator",
  description: "Estimate the fuel cost for a trip based on distance, efficiency, and fuel price.",
  category: "other",
  icon: Fuel,
  keywords: ["fuel cost", "gas cost calculator", "trip cost", "road trip fuel"],
  inputs: [
    { name: "distance", label: "Trip distance (miles)", kind: "number", defaultValue: "", step: 1, required: true },
    { name: "fuelEfficiency", label: "Fuel efficiency (mpg)", kind: "number", defaultValue: "", step: 0.1, required: true },
    { name: "fuelPrice", label: "Fuel price (per gallon)", kind: "currency", defaultValue: "", required: true },
  ],
  schema: fuelCostSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Fuel needed = Distance ÷ MPG. Total cost = Fuel needed × price per gallon.",
  explanation: [
    {
      heading: "Real-world mileage varies",
      body: "Actual fuel efficiency depends on speed, terrain, load, and driving style — your EPA-estimated mpg is a useful starting point, not a guarantee.",
    },
  ],
  faq: [
    { q: "Round trip or one-way?", a: "Enter the total distance you'll actually drive — double a one-way distance if you're planning for a round trip." },
  ],
  related: ["gas-mileage", "mileage-reimbursement"],
};
