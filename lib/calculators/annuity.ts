import { Repeat } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";
import { Decimal, monthlyPayment, toMoney } from "../decimal-utils";

const MODES = ["accumulate", "payout"] as const;
const FREQUENCIES = ["annually", "quarterly", "monthly"] as const;
const PERIODS_PER_YEAR: Record<(typeof FREQUENCIES)[number], number> = {
  annually: 1,
  quarterly: 4,
  monthly: 12,
};

export const annuitySchema = z.object({
  mode: selectField(MODES, "Mode"),
  amount: numberField({ label: "Amount", min: 0.01, max: 1_000_000_000 }),
  annualRate: numberField({ label: "Annual interest rate", min: 0, max: 100 }),
  years: numberField({ label: "Number of years", min: 0.1, max: 100 }),
  frequency: selectField(FREQUENCIES, "Payment frequency"),
});

export type AnnuityValues = z.infer<typeof annuitySchema>;

function calculate(values: AnnuityValues): CalcResult {
  const amount = new Decimal(values.amount);
  const rate = new Decimal(values.annualRate).dividedBy(100);
  const n = PERIODS_PER_YEAR[values.frequency];
  const periodicRate = rate.dividedBy(n);
  const periods = Math.round(values.years * n);

  if (values.mode === "accumulate") {
    const growth = periodicRate.plus(1).pow(periods);
    const futureValue = periodicRate.isZero()
      ? amount.times(periods)
      : amount.times(growth.minus(1).dividedBy(periodicRate));
    const totalContributed = amount.times(periods);
    const totalInterest = futureValue.minus(totalContributed);

    return {
      primary: { key: "futureValue", label: "Future value", value: toMoney(futureValue), format: "currency" },
      secondary: [
        { key: "totalContributed", label: "Total contributed", value: toMoney(totalContributed), format: "currency" },
        { key: "totalInterest", label: "Total interest earned", value: toMoney(totalInterest), format: "currency" },
      ],
    };
  }

  // payout: amount is a lump sum to be paid out evenly over the term
  const payoutPerPeriod = monthlyPayment(amount, periodicRate, periods);
  const totalPaidOut = payoutPerPeriod.times(periods);
  const totalInterest = totalPaidOut.minus(amount);

  return {
    primary: { key: "payoutPerPeriod", label: "Payout per period", value: toMoney(payoutPerPeriod), format: "currency" },
    secondary: [
      { key: "totalPaidOut", label: "Total paid out", value: toMoney(totalPaidOut), format: "currency" },
      { key: "totalInterest", label: "Total interest earned", value: toMoney(totalInterest), format: "currency" },
    ],
  };
}

export const annuityCalculator: CalculatorDef = {
  id: "annuity",
  slug: "annuity",
  title: "Annuity Calculator",
  description: "Calculate the future value of regular annuity contributions, or the payout from a lump sum.",
  category: "finance",
  icon: Repeat,
  keywords: ["annuity", "annuity payout", "fixed annuity", "retirement income"],
  inputs: [
    {
      name: "mode",
      label: "Calculation type",
      kind: "segmented",
      defaultValue: "accumulate",
      options: [
        { value: "accumulate", label: "Grow (accumulation)" },
        { value: "payout", label: "Payout (decumulation)" },
      ],
    },
    { name: "amount", label: "Regular payment amount", kind: "currency", defaultValue: "", required: true },
    { name: "annualRate", label: "Annual interest rate (%)", kind: "percentage", defaultValue: "", required: true },
    { name: "years", label: "Number of years", kind: "number", defaultValue: "10", min: 0.1, max: 100, step: 1, required: true },
    {
      name: "frequency",
      label: "Payment frequency",
      kind: "select",
      defaultValue: "monthly",
      options: [
        { value: "annually", label: "Annually" },
        { value: "quarterly", label: "Quarterly" },
        { value: "monthly", label: "Monthly" },
      ],
    },
  ],
  schema: annuitySchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  dynamicLabels: (values) => ({
    amount: values.mode === "payout" ? "Lump sum amount" : "Regular payment amount",
  }),
  formula: "Accumulation: FV = PMT × [((1 + i)ⁿ − 1) ÷ i]. Payout: PMT = PV × i ÷ (1 − (1 + i)⁻ⁿ), where i is the periodic rate and n is the number of periods.",
  explanation: [
    {
      heading: "Two sides of an annuity",
      body: "During the accumulation phase you make regular payments that grow over time. During the payout phase, a lump sum is drawn down through regular fixed payments until it's exhausted.",
    },
  ],
  faq: [
    { q: "What's the difference between this and the Loan Calculator?", a: "The payout mode uses the same amortization math as a loan payment, just reframed as income drawn from savings instead of a debt being repaid." },
  ],
  related: ["retirement", "compound-interest", "future-value"],
};
