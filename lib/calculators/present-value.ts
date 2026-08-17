import { Hourglass } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";
import { Decimal, toMoney } from "../decimal-utils";

const FREQUENCIES = ["annually", "semiannually", "quarterly", "monthly", "daily"] as const;
const PERIODS_PER_YEAR: Record<(typeof FREQUENCIES)[number], number> = {
  annually: 1,
  semiannually: 2,
  quarterly: 4,
  monthly: 12,
  daily: 365,
};

export const presentValueSchema = z.object({
  futureValue: numberField({ label: "Future value", min: 0, max: 1_000_000_000 }),
  annualRate: numberField({ label: "Discount rate", min: 0, max: 100 }),
  years: numberField({ label: "Number of years", min: 0, max: 100 }),
  frequency: selectField(FREQUENCIES, "Compounding frequency"),
});

export type PresentValueValues = z.infer<typeof presentValueSchema>;

function calculate(values: PresentValueValues): CalcResult {
  const futureValue = new Decimal(values.futureValue);
  const rate = new Decimal(values.annualRate).dividedBy(100);
  const n = PERIODS_PER_YEAR[values.frequency];
  const periodicRate = rate.dividedBy(n);
  const periods = Math.round(values.years * n);

  const discountFactor = periodicRate.plus(1).pow(periods);
  const presentValue = periods === 0 ? futureValue : futureValue.dividedBy(discountFactor);
  const totalDiscount = futureValue.minus(presentValue);

  return {
    primary: { key: "presentValue", label: "Present value", value: toMoney(presentValue), format: "currency" },
    secondary: [
      { key: "futureValue", label: "Future value", value: toMoney(futureValue), format: "currency" },
      { key: "totalDiscount", label: "Total discount", value: toMoney(totalDiscount), format: "currency" },
    ],
  };
}

export const presentValueCalculator: CalculatorDef = {
  id: "present-value",
  slug: "present-value",
  title: "Present Value Calculator",
  description: "Find today's value of a future sum of money, discounted at a given rate.",
  category: "finance",
  icon: Hourglass,
  keywords: ["present value", "pv", "discounted value", "time value of money"],
  inputs: [
    { name: "futureValue", label: "Future value", kind: "currency", defaultValue: "", required: true },
    { name: "annualRate", label: "Discount rate (annual %)", kind: "percentage", defaultValue: "", required: true },
    { name: "years", label: "Number of years", kind: "number", defaultValue: "5", min: 0, max: 100, step: 1, required: true },
    {
      name: "frequency",
      label: "Compounding frequency",
      kind: "select",
      defaultValue: "annually",
      options: [
        { value: "annually", label: "Annually" },
        { value: "semiannually", label: "Semiannually" },
        { value: "quarterly", label: "Quarterly" },
        { value: "monthly", label: "Monthly" },
        { value: "daily", label: "Daily" },
      ],
    },
  ],
  schema: presentValueSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "PV = FV ÷ (1 + r/n)ⁿᵗ, where r is the annual discount rate, n is periods per year, and t is years.",
  explanation: [
    {
      heading: "Why money today is worth more",
      body: "A dollar today is worth more than a dollar in the future because it can be invested to earn a return. Present value discounts a future amount back to its equivalent value today.",
    },
  ],
  faq: [
    { q: "What discount rate should I use?", a: "Use your expected rate of return, cost of capital, or a benchmark rate like inflation, depending on what you're evaluating." },
  ],
  related: ["future-value", "compound-interest"],
};
