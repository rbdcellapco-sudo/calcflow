import { Receipt } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";

export const tipSchema = z.object({
  billAmount: numberField({ label: "Bill amount", min: 0 }),
  tipPercent: numberField({ label: "Tip percentage", min: 0, max: 500 }),
  numPeople: numberField({ label: "Number of people", min: 1, max: 500, integer: true }),
});

export type TipValues = z.infer<typeof tipSchema>;

function calculate(values: TipValues): CalcResult {
  const { billAmount, tipPercent, numPeople } = values;
  const tipAmount = billAmount * (tipPercent / 100);
  const total = billAmount + tipAmount;
  const perPersonTotal = total / numPeople;
  const perPersonTip = tipAmount / numPeople;

  return {
    primary: { key: "total", label: "Total bill", value: total, format: "currency" },
    secondary: [
      { key: "tipAmount", label: "Tip amount", value: tipAmount, format: "currency" },
      { key: "perPersonTotal", label: "Per person", value: perPersonTotal, format: "currency", emphasis: numPeople > 1 },
      { key: "perPersonTip", label: "Tip per person", value: perPersonTip, format: "currency" },
    ],
  };
}

export const tipCalculator: CalculatorDef = {
  id: "tip",
  slug: "tip",
  title: "Tip Calculator",
  description: "Calculate the tip amount, total bill, and split evenly per person.",
  category: "finance",
  icon: Receipt,
  keywords: ["gratuity", "restaurant", "split bill", "tip calculator"],
  inputs: [
    { name: "billAmount", label: "Bill amount", kind: "currency", defaultValue: "", required: true },
    { name: "tipPercent", label: "Tip percentage", kind: "percentage", defaultValue: "18", required: true },
    { name: "numPeople", label: "Number of people", kind: "number", defaultValue: "1", min: 1, step: 1, required: true },
  ],
  schema: tipSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Tip = Bill × (Tip % ÷ 100). Total = Bill + Tip. Per person = Total ÷ Number of people.",
  explanation: [
    {
      heading: "Tipping guide",
      body: "15–20% is a common tip range in the US for good restaurant service. Split evenly by dividing the total by the number of people at the table.",
    },
  ],
  faq: [
    { q: "Should I tip before or after tax?", a: "Most guides suggest tipping on the pre-tax amount, though many people simply tip on the total bill shown." },
  ],
  related: ["percentage"],
};
