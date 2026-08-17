import { PiggyBank } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";
import { Decimal, toMoney } from "../decimal-utils";

export const rothIraSchema = z.object({
  currentAge: numberField({ label: "Current age", min: 1, max: 100, integer: true }),
  retirementAge: numberField({ label: "Retirement age", min: 1, max: 100, integer: true }),
  currentBalance: numberField({ label: "Current Roth IRA balance", min: 0, max: 1_000_000_000 }),
  annualContribution: numberField({ label: "Annual contribution", min: 0, max: 1_000_000 }),
  annualReturn: numberField({ label: "Expected annual return", min: 0, max: 100 }),
});

export type RothIraValues = z.infer<typeof rothIraSchema>;

function calculate(values: RothIraValues): CalcResult {
  const currentBalance = new Decimal(values.currentBalance);
  const annualContribution = new Decimal(values.annualContribution);
  const monthlyContribution = annualContribution.dividedBy(12);
  const monthlyRate = new Decimal(values.annualReturn).dividedBy(100).dividedBy(12);
  const months = Math.round((values.retirementAge - values.currentAge) * 12);

  const growth = monthlyRate.plus(1).pow(months);
  const fvBalance = currentBalance.times(growth);
  const fvContributions = monthlyRate.isZero()
    ? monthlyContribution.times(months)
    : monthlyContribution.times(growth.minus(1).dividedBy(monthlyRate));

  const taxFreeBalance = fvBalance.plus(fvContributions);
  const totalContributed = annualContribution.times(values.retirementAge - values.currentAge);
  const totalGrowth = taxFreeBalance.minus(currentBalance).minus(totalContributed);

  return {
    primary: { key: "taxFreeBalance", label: `Tax-free balance at age ${values.retirementAge}`, value: toMoney(taxFreeBalance), format: "currency" },
    secondary: [
      { key: "totalContributed", label: "Total contributed", value: toMoney(totalContributed), format: "currency" },
      { key: "totalGrowth", label: "Total tax-free growth", value: toMoney(totalGrowth), format: "currency" },
    ],
    notes: ["Roth IRA contributions are made with after-tax money, so qualified withdrawals in retirement are tax-free. Annual contribution and income limits aren't enforced here since they change yearly."],
  };
}

export const rothIraCalculator: CalculatorDef = {
  id: "roth-ira",
  slug: "roth-ira",
  title: "Roth IRA Calculator",
  description: "Project your Roth IRA balance at retirement, growing and withdrawing completely tax-free.",
  category: "finance",
  icon: PiggyBank,
  region: "US",
  keywords: ["roth ira", "tax-free retirement", "individual retirement account"],
  inputs: [
    { name: "currentAge", label: "Current age", kind: "number", defaultValue: "30", min: 1, max: 100, step: 1, required: true },
    { name: "retirementAge", label: "Retirement age", kind: "number", defaultValue: "65", min: 1, max: 100, step: 1, required: true },
    { name: "currentBalance", label: "Current Roth IRA balance", kind: "currency", defaultValue: "0", required: true },
    { name: "annualContribution", label: "Annual contribution", kind: "currency", defaultValue: "", required: true },
    { name: "annualReturn", label: "Expected annual return (%)", kind: "percentage", defaultValue: "7", required: true },
  ],
  schema: rothIraSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Balance = Current balance × (1 + i)ⁿ + Monthly contribution × [((1 + i)ⁿ − 1) ÷ i]. The full result is available tax-free at qualified withdrawal.",
  explanation: [
    {
      heading: "Why tax-free growth matters",
      body: "Because Roth contributions are already taxed, every dollar of growth compounds without a future tax bill — often a bigger advantage the longer money stays invested.",
    },
  ],
  faq: [
    { q: "How is this different from the Traditional IRA Calculator?", a: "A traditional IRA defers tax to withdrawal; a Roth IRA pays tax upfront so growth and qualified withdrawals are tax-free." },
  ],
  related: ["ira", "401k", "retirement"],
};
