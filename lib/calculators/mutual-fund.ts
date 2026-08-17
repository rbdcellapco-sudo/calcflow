import { PieChart } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";
import { Decimal, toMoney } from "../decimal-utils";

export const mutualFundSchema = z.object({
  initialInvestment: numberField({ label: "Initial investment", min: 0, max: 1_000_000_000 }),
  monthlyInvestment: numberField({ label: "Monthly SIP investment", min: 0, max: 1_000_000, required: false }),
  annualReturnRate: numberField({ label: "Expected annual return", min: 0, max: 100 }),
  years: numberField({ label: "Number of years", min: 0, max: 100 }),
  expenseRatio: numberField({ label: "Expense ratio", min: 0, max: 10, required: false }),
});

export type MutualFundValues = z.infer<typeof mutualFundSchema>;

function futureValue(principal: Decimal, monthlyContribution: Decimal, annualRatePercent: Decimal, years: number): { fv: Decimal } {
  const monthlyRate = annualRatePercent.dividedBy(100).dividedBy(12);
  const months = Math.round(years * 12);
  const growth = monthlyRate.plus(1).pow(months);
  const fvPrincipal = principal.times(growth);
  const fvContributions = monthlyRate.isZero()
    ? monthlyContribution.times(months)
    : monthlyContribution.times(growth.minus(1).dividedBy(monthlyRate));
  return { fv: fvPrincipal.plus(fvContributions) };
}

function calculate(values: MutualFundValues): CalcResult {
  const initial = new Decimal(values.initialInvestment);
  const monthly = new Decimal(values.monthlyInvestment ?? 0);
  const expenseRatio = new Decimal(values.expenseRatio ?? 0);

  const grossReturn = new Decimal(values.annualReturnRate);
  const netReturn = Decimal.max(grossReturn.minus(expenseRatio), 0);

  const { fv: fvGross } = futureValue(initial, monthly, grossReturn, values.years);
  const { fv: fvNet } = futureValue(initial, monthly, netReturn, values.years);

  const totalInvested = initial.plus(monthly.times(Math.round(values.years * 12)));
  const feeDrag = fvGross.minus(fvNet);

  const secondary = [
    { key: "totalInvested", label: "Total invested", value: toMoney(totalInvested), format: "currency" as const },
    { key: "totalGrowth", label: "Total growth (after fees)", value: toMoney(fvNet.minus(totalInvested)), format: "currency" as const },
  ];
  if (expenseRatio.greaterThan(0)) {
    secondary.push({ key: "feeDrag", label: "Cost of expense ratio (vs. fee-free)", value: toMoney(feeDrag), format: "currency" as const });
  }

  return {
    primary: { key: "futureValue", label: "Projected value", value: toMoney(fvNet), format: "currency" },
    secondary,
  };
}

export const mutualFundCalculator: CalculatorDef = {
  id: "mutual-fund",
  slug: "mutual-fund",
  title: "Mutual Fund Calculator",
  description: "Project mutual fund growth from a lump sum and SIP contributions, net of the expense ratio.",
  category: "finance",
  icon: PieChart,
  keywords: ["mutual fund", "sip", "expense ratio", "fund growth"],
  inputs: [
    { name: "initialInvestment", label: "Initial investment", kind: "currency", defaultValue: "", required: true },
    { name: "monthlyInvestment", label: "Monthly SIP investment", kind: "currency", defaultValue: "0", required: false },
    { name: "annualReturnRate", label: "Expected annual return (%)", kind: "percentage", defaultValue: "10", required: true },
    { name: "years", label: "Number of years", kind: "number", defaultValue: "15", min: 0, max: 100, step: 1, required: true },
  ],
  advancedInputs: [
    { name: "expenseRatio", label: "Expense ratio (%)", kind: "percentage", defaultValue: "0", required: false, helpText: "Annual fund management fee, deducted from your return." },
  ],
  schema: mutualFundSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Net return = Gross return − Expense ratio. Growth uses the same compounding formula as regular SIP/contribution growth, just applied to the fee-adjusted rate.",
  explanation: [
    {
      heading: "Small fees, big long-term cost",
      body: "An expense ratio might look small year to year, but compounded over decades it can meaningfully reduce your final balance — this calculator shows exactly how much.",
    },
  ],
  faq: [
    { q: "What's a typical expense ratio?", a: "Index funds often charge well under 0.5%, while actively managed funds commonly charge 1% or more — check your specific fund's disclosure." },
  ],
  related: ["compound-interest", "future-value", "average-return"],
};
