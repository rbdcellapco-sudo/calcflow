import { Car } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";

export const mileageReimbursementSchema = z.object({
  miles: numberField({ label: "Miles driven", min: 0, max: 1_000_000 }),
  ratePerMile: numberField({ label: "Reimbursement rate (per mile)", min: 0, max: 100 }),
});

export type MileageReimbursementValues = z.infer<typeof mileageReimbursementSchema>;

function calculate(values: MileageReimbursementValues): CalcResult {
  const total = values.miles * values.ratePerMile;

  return {
    primary: { key: "total", label: "Total reimbursement", value: Math.round(total * 100) / 100, format: "currency" },
    secondary: [],
  };
}

export const mileageReimbursementCalculator: CalculatorDef = {
  id: "mileage-reimbursement",
  slug: "mileage-reimbursement",
  title: "Mileage Reimbursement Calculator",
  description: "Calculate business mileage reimbursement from miles driven and a per-mile rate.",
  category: "other",
  icon: Car,
  keywords: ["mileage reimbursement", "business mileage", "irs mileage rate", "mileage calculator"],
  inputs: [
    { name: "miles", label: "Miles driven", kind: "number", defaultValue: "", step: 0.1, required: true },
    { name: "ratePerMile", label: "Reimbursement rate (per mile)", kind: "currency", defaultValue: "", required: true, helpText: "Check your country's current standard mileage rate, or your employer's policy rate." },
  ],
  schema: mileageReimbursementSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Reimbursement = Miles driven × rate per mile.",
  explanation: [
    {
      heading: "Rates change periodically",
      body: "Standard mileage rates (like the IRS rate in the US) are typically updated annually — always use the current rate for the tax year or reimbursement period in question.",
    },
  ],
  faq: [
    { q: "Does this cover fuel costs directly?", a: "No — the per-mile rate is meant to cover fuel plus wear, maintenance, and depreciation combined, not just fuel. Use the Fuel Cost Calculator if you only want fuel expense." },
  ],
  related: ["fuel-cost", "gas-mileage"],
};
