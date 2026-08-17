import { Gauge } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef, ResultValue } from "../types";
import { numberField } from "../validation";

export const gasMileageSchema = z.object({
  distance: numberField({ label: "Distance driven (miles)", min: 0.1, max: 1_000_000 }),
  fuelUsed: numberField({ label: "Fuel used (gallons)", min: 0.01, max: 100_000 }),
  fuelPrice: numberField({ label: "Fuel price (per gallon)", min: 0, max: 100, required: false }),
});

export type GasMileageValues = z.infer<typeof gasMileageSchema>;

function calculate(values: GasMileageValues): CalcResult {
  const mpg = values.distance / values.fuelUsed;
  const secondary: ResultValue[] = [];

  if (values.fuelPrice) {
    const costPerMile = values.fuelPrice / mpg;
    secondary.push({ key: "costPerMile", label: "Cost per mile", value: Math.round(costPerMile * 1000) / 1000, format: "currency" as const });
  }

  return {
    primary: { key: "mpg", label: "Fuel economy", value: Math.round(mpg * 100) / 100, format: "number", unit: "mpg" },
    secondary,
  };
}

export const gasMileageCalculator: CalculatorDef = {
  id: "gas-mileage",
  slug: "gas-mileage",
  title: "Gas Mileage Calculator",
  description: "Calculate your vehicle's fuel economy (MPG) from miles driven and fuel used.",
  category: "other",
  icon: Gauge,
  keywords: ["gas mileage", "mpg calculator", "fuel economy", "miles per gallon"],
  inputs: [
    { name: "distance", label: "Distance driven (miles)", kind: "number", defaultValue: "", step: 1, required: true },
    { name: "fuelUsed", label: "Fuel used (gallons)", kind: "number", defaultValue: "", step: 0.01, required: true },
  ],
  advancedInputs: [
    { name: "fuelPrice", label: "Fuel price (per gallon, optional)", kind: "currency", defaultValue: "", required: false },
  ],
  schema: gasMileageSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "MPG = Distance driven ÷ Fuel used.",
  explanation: [
    {
      heading: "Track over a full tank for accuracy",
      body: "For the most accurate reading, fill your tank completely, reset your trip odometer, then measure fuel used at your next full fill-up.",
    },
  ],
  faq: [
    { q: "How do I estimate a road trip's fuel cost from this?", a: "Use your calculated MPG in the Fuel Cost Calculator along with your trip distance and current fuel price." },
  ],
  related: ["fuel-cost", "mileage-reimbursement"],
};
