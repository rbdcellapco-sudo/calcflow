import { LineChart } from "lucide-react";
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
const TIMINGS = ["end", "beginning"] as const;

export const futureValueSchema = z.object({
  presentValue: numberField({ label: "Starting amount", min: 0, max: 1_000_000_000 }),
  contribution: numberField({ label: "Contribution per period", min: 0, max: 1_000_000, required: false }),
  annualRate: numberField({ label: "Annual rate", min: 0, max: 100 }),
  years: numberField({ label: "Number of years", min: 0, max: 100 }),
  frequency: selectField(FREQUENCIES, "Compounding frequency"),
  timing: selectField(TIMINGS, "Contribution timing"),
});

export type FutureValueValues = z.infer<typeof futureValueSchema>;

function calculate(values: FutureValueValues): CalcResult {
  const presentValue = new Decimal(values.presentValue);
  const contribution = new Decimal(values.contribution ?? 0);
  const rate = new Decimal(values.annualRate).dividedBy(100);
  const n = PERIODS_PER_YEAR[values.frequency];
  const periodicRate = rate.dividedBy(n);
  const periods = Math.round(values.years * n);

  const growth = periodicRate.plus(1).pow(periods);
  const fvPrincipal = presentValue.times(growth);

  let fvContributions = new Decimal(0);
  if (contribution.greaterThan(0) && periods > 0) {
    fvContributions = periodicRate.isZero()
      ? contribution.times(periods)
      : contribution.times(growth.minus(1).dividedBy(periodicRate));
    if (values.timing === "beginning" && !periodicRate.isZero()) {
      fvContributions = fvContributions.times(periodicRate.plus(1));
    }
  }

  const futureValue = fvPrincipal.plus(fvContributions);
  const totalContributions = contribution.times(periods);
  const totalDeposited = presentValue.plus(totalContributions);
  const totalGrowth = futureValue.minus(totalDeposited);

  return {
    primary: { key: "futureValue", label: "Future value", value: toMoney(futureValue), format: "currency" },
    secondary: [
      { key: "totalDeposited", label: "Total deposited", value: toMoney(totalDeposited), format: "currency" },
      { key: "totalGrowth", label: "Total growth", value: toMoney(totalGrowth), format: "currency" },
    ],
  };
}

export const futureValueCalculator: CalculatorDef = {
  id: "future-value",
  slug: "future-value",
  title: "Future Value Calculator",
  description: "Project the future value of a starting amount plus regular contributions.",
  category: "finance",
  icon: LineChart,
  keywords: ["future value", "fv", "projected growth", "time value of money"],
  inputs: [
    { name: "presentValue", label: "Starting amount", kind: "currency", defaultValue: "", required: true },
    { name: "annualRate", label: "Annual rate (%)", kind: "percentage", defaultValue: "", required: true },
    { name: "years", label: "Number of years", kind: "number", defaultValue: "10", min: 0, max: 100, step: 1, required: true },
    {
      name: "frequency",
      label: "Compounding frequency",
      kind: "select",
      defaultValue: "monthly",
      options: [
        { value: "annually", label: "Annually" },
        { value: "semiannually", label: "Semiannually" },
        { value: "quarterly", label: "Quarterly" },
        { value: "monthly", label: "Monthly" },
        { value: "daily", label: "Daily" },
      ],
    },
  ],
  advancedInputs: [
    { name: "contribution", label: "Contribution per period", kind: "currency", defaultValue: "0", required: false },
    {
      name: "timing",
      label: "Contribution timing",
      kind: "segmented",
      defaultValue: "end",
      options: [
        { value: "end", label: "End of period" },
        { value: "beginning", label: "Beginning of period" },
      ],
    },
  ],
  schema: futureValueSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "FV = PV(1 + i)ⁿ + PMT × [((1 + i)ⁿ − 1) ÷ i], adjusted for beginning-of-period contributions when selected.",
  explanation: [
    {
      heading: "Ordinary annuity vs. annuity due",
      body: "Contributions made at the end of each period (ordinary annuity) grow slightly less than the same contributions made at the beginning (annuity due), since beginning-of-period money compounds for one extra period.",
    },
  ],
  faq: [
    { q: "How is this different from the Compound Interest Calculator?", a: "This calculator adds control over whether contributions land at the start or end of each period, which slightly changes the result." },
  ],
  related: ["present-value", "compound-interest", "annuity"],
};
