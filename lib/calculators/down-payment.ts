import { HandCoins } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";
import { Decimal, toMoney, toRounded } from "../decimal-utils";

const MODES = ["percent", "amount"] as const;

export const downPaymentSchema = z.object({
  mode: selectField(MODES, "Mode"),
  homePrice: numberField({ label: "Home price", min: 1, max: 1_000_000_000 }),
  value: numberField({ label: "Down payment", min: 0, max: 1_000_000_000 }),
});

export type DownPaymentValues = z.infer<typeof downPaymentSchema>;

function calculate(values: DownPaymentValues): CalcResult {
  const homePrice = new Decimal(values.homePrice);
  const inputValue = new Decimal(values.value);

  const downPaymentAmount = values.mode === "percent" ? homePrice.times(inputValue.dividedBy(100)) : inputValue;
  const downPaymentPercent = values.mode === "percent" ? inputValue : inputValue.dividedBy(homePrice).times(100);
  const loanAmount = homePrice.minus(downPaymentAmount);

  return {
    primary: { key: "downPaymentAmount", label: "Down payment amount", value: toMoney(downPaymentAmount), format: "currency" },
    secondary: [
      { key: "downPaymentPercent", label: "Down payment percentage", value: toRounded(downPaymentPercent), format: "percentage" },
      { key: "loanAmount", label: "Resulting loan amount", value: toMoney(loanAmount), format: "currency" },
    ],
  };
}

export const downPaymentCalculator: CalculatorDef = {
  id: "down-payment",
  slug: "down-payment",
  title: "Down Payment Calculator",
  description: "Convert between a down payment percentage and amount, and see the resulting loan size.",
  category: "finance",
  icon: HandCoins,
  keywords: ["down payment", "loan to value", "home purchase"],
  inputs: [
    {
      name: "mode",
      label: "Enter down payment as",
      kind: "segmented",
      defaultValue: "percent",
      options: [
        { value: "percent", label: "Percentage" },
        { value: "amount", label: "Amount" },
      ],
    },
    { name: "homePrice", label: "Home price", kind: "currency", defaultValue: "", required: true },
    { name: "value", label: "Down payment", kind: "number", defaultValue: "20", required: true },
  ],
  schema: downPaymentSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  dynamicLabels: (values) => ({
    value: values.mode === "amount" ? "Down payment amount" : "Down payment percentage",
  }),
  formula: "Loan amount = Home price − Down payment amount.",
  explanation: [
    {
      heading: "Why 20% is a common target",
      body: "Putting down at least 20% on a home purchase typically avoids private mortgage insurance (PMI) on a conventional loan, though many loan programs allow much less.",
    },
  ],
  faq: [
    { q: "Can I put down less than 20%?", a: "Yes — many conventional and government-backed loans allow down payments as low as 3-5%, usually with added mortgage insurance." },
  ],
  related: ["mortgage", "house-affordability", "home-equity-loan"],
};
