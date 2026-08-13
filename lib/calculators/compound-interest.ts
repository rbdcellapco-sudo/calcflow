import { TrendingUp } from "lucide-react";
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

export const compoundInterestSchema = z.object({
  principal: numberField({ label: "Initial amount", min: 0, max: 1_000_000_000 }),
  annualRate: numberField({ label: "Annual interest rate", min: 0, max: 100 }),
  years: numberField({ label: "Number of years", min: 0, max: 100 }),
  frequency: selectField(FREQUENCIES, "Compounding frequency"),
  contributionPerPeriod: numberField({ label: "Additional contribution per period", min: 0, required: false }),
});

export type CompoundInterestValues = z.infer<typeof compoundInterestSchema>;

function calculate(values: CompoundInterestValues): CalcResult {
  const principal = new Decimal(values.principal);
  const rate = new Decimal(values.annualRate).dividedBy(100);
  const n = PERIODS_PER_YEAR[values.frequency];
  const periodicRate = rate.dividedBy(n);
  const periods = Math.round(values.years * n);
  const contribution = new Decimal(values.contributionPerPeriod ?? 0);

  const growth = periodicRate.plus(1).pow(periods);
  const futureValuePrincipal = principal.times(growth);

  let contributionFV = new Decimal(0);
  if (contribution.greaterThan(0)) {
    contributionFV = periodicRate.isZero()
      ? contribution.times(periods)
      : contribution.times(growth.minus(1).dividedBy(periodicRate));
  }

  const totalFutureValue = futureValuePrincipal.plus(contributionFV);
  const totalContributions = contribution.times(periods);
  const totalDeposited = principal.plus(totalContributions);
  const totalInterestEarned = totalFutureValue.minus(totalDeposited);

  return {
    primary: { key: "futureValue", label: "Future value", value: toMoney(totalFutureValue), format: "currency" },
    secondary: [
      { key: "totalDeposited", label: "Total deposited", value: toMoney(totalDeposited), format: "currency" },
      { key: "totalInterest", label: "Total interest earned", value: toMoney(totalInterestEarned), format: "currency" },
      { key: "startingPrincipal", label: "Starting amount", value: toMoney(principal), format: "currency" },
      { key: "periods", label: "Compounding periods", value: periods, format: "number" },
    ],
  };
}

export const compoundInterestCalculator: CalculatorDef = {
  id: "compound-interest",
  slug: "compound-interest",
  title: "Compound Interest Calculator",
  description: "See how your savings or investment grows with compound interest and regular contributions.",
  category: "finance",
  icon: TrendingUp,
  keywords: ["investment growth", "savings growth", "interest", "future value"],
  inputs: [
    { name: "principal", label: "Initial amount", kind: "currency", defaultValue: "", required: true },
    { name: "annualRate", label: "Annual interest rate (%)", kind: "percentage", defaultValue: "", required: true },
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
    {
      name: "contributionPerPeriod",
      label: "Additional contribution per period",
      kind: "currency",
      defaultValue: "0",
      required: false,
      helpText: "Added at the end of each compounding period you selected above.",
    },
  ],
  schema: compoundInterestSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "A = P(1 + r/n)ⁿᵗ + PMT × [((1 + r/n)ⁿᵗ − 1) ÷ (r/n)]",
  explanation: [
    {
      heading: "The power of compounding",
      body: "Compound interest means you earn interest on your interest, not just your original deposit. More frequent compounding and regular contributions both accelerate growth.",
    },
  ],
  faq: [
    { q: "What's the difference between compound and simple interest?", a: "Simple interest is earned only on the principal. Compound interest is earned on the principal plus all previously accumulated interest." },
  ],
  related: ["mortgage", "loan"],
};
