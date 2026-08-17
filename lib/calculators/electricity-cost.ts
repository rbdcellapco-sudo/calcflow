import { Plug } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";

export const electricityCostSchema = z.object({
  watts: numberField({ label: "Power (watts)", min: 0, max: 100_000 }),
  hoursPerDay: numberField({ label: "Hours used per day", min: 0, max: 24 }),
  costPerKwh: numberField({ label: "Cost per kWh", min: 0, max: 1000 }),
});

export type ElectricityCostValues = z.infer<typeof electricityCostSchema>;

function calculate(values: ElectricityCostValues): CalcResult {
  const kwhPerDay = (values.watts * values.hoursPerDay) / 1000;
  const costPerDay = kwhPerDay * values.costPerKwh;

  return {
    primary: { key: "costPerMonth", label: "Estimated cost per month", value: Math.round(costPerDay * 30 * 100) / 100, format: "currency" },
    secondary: [
      { key: "costPerDay", label: "Cost per day", value: Math.round(costPerDay * 100) / 100, format: "currency" },
      { key: "costPerYear", label: "Cost per year", value: Math.round(costPerDay * 365 * 100) / 100, format: "currency" },
      { key: "kwhPerDay", label: "Energy used per day", value: Math.round(kwhPerDay * 1000) / 1000, format: "number", unit: "kWh" },
    ],
  };
}

export const electricityCostCalculator: CalculatorDef = {
  id: "electricity-cost",
  slug: "electricity-cost",
  title: "Electricity Cost Calculator",
  description: "Estimate the cost of running an appliance based on its wattage and usage.",
  category: "other",
  icon: Plug,
  keywords: ["electricity cost", "appliance cost", "kwh calculator", "power usage cost"],
  inputs: [
    { name: "watts", label: "Power (watts)", kind: "number", defaultValue: "", step: 1, required: true, helpText: "Check the appliance's label or spec sheet." },
    { name: "hoursPerDay", label: "Hours used per day", kind: "number", defaultValue: "", min: 0, max: 24, step: 0.1, required: true },
    { name: "costPerKwh", label: "Cost per kWh", kind: "currency", defaultValue: "", required: true, helpText: "Check your electricity bill for your rate." },
  ],
  schema: electricityCostSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Energy (kWh) = Watts × Hours ÷ 1000. Cost = Energy × price per kWh.",
  explanation: [
    {
      heading: "Watts vs. kilowatt-hours",
      body: "Watts measure instantaneous power draw; kilowatt-hours measure energy consumed over time — utility bills charge based on kWh, not watts alone.",
    },
  ],
  faq: [
    { q: "Where do I find an appliance's wattage?", a: "Check the nameplate/label on the device, its manual, or multiply its voltage by amperage if only those are listed." },
  ],
  related: ["ohms-law", "resistor"],
};
