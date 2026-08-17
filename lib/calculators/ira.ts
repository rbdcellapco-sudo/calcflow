import { Vault } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";
import { Decimal, toMoney } from "../decimal-utils";

export const iraSchema = z.object({
  currentAge: numberField({ label: "Current age", min: 1, max: 100, integer: true }),
  retirementAge: numberField({ label: "Retirement age", min: 1, max: 100, integer: true }),
  currentBalance: numberField({ label: "Current IRA balance", min: 0, max: 1_000_000_000 }),
  annualContribution: numberField({ label: "Annual contribution", min: 0, max: 1_000_000 }),
  annualReturn: numberField({ label: "Expected annual return", min: 0, max: 100 }),
  retirementTaxRate: numberField({ label: "Estimated tax rate at withdrawal", min: 0, max: 100, required: false }),
});

export type IraValues = z.infer<typeof iraSchema>;

function calculate(values: IraValues): CalcResult {
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

  const preTaxBalance = fvBalance.plus(fvContributions);
  const totalContributed = annualContribution.times(values.retirementAge - values.currentAge);

  const secondary = [
    { key: "totalContributed", label: "Total contributed", value: toMoney(totalContributed), format: "currency" as const },
    { key: "totalGrowth", label: "Total growth", value: toMoney(preTaxBalance.minus(currentBalance).minus(totalContributed)), format: "currency" as const },
  ];

  const taxRate = values.retirementTaxRate;
  if (taxRate !== undefined && taxRate > 0) {
    const afterTaxBalance = preTaxBalance.times(new Decimal(100).minus(taxRate).dividedBy(100));
    secondary.push({ key: "afterTaxBalance", label: "Estimated after-tax balance", value: toMoney(afterTaxBalance), format: "currency" as const });
  }

  return {
    primary: { key: "preTaxBalance", label: `Pre-tax balance at age ${values.retirementAge}`, value: toMoney(preTaxBalance), format: "currency" },
    secondary,
    notes: ["Traditional IRA contributions and growth are tax-deferred; withdrawals in retirement are taxed as ordinary income. Annual contribution limits aren't enforced here since they change yearly."],
  };
}

export const iraCalculator: CalculatorDef = {
  id: "ira",
  slug: "ira",
  title: "Traditional IRA Calculator",
  description: "Project your traditional IRA balance at retirement, tax-deferred until withdrawal.",
  category: "finance",
  icon: Vault,
  region: "US",
  keywords: ["ira", "traditional ira", "individual retirement account", "tax-deferred"],
  inputs: [
    { name: "currentAge", label: "Current age", kind: "number", defaultValue: "30", min: 1, max: 100, step: 1, required: true },
    { name: "retirementAge", label: "Retirement age", kind: "number", defaultValue: "65", min: 1, max: 100, step: 1, required: true },
    { name: "currentBalance", label: "Current IRA balance", kind: "currency", defaultValue: "0", required: true },
    { name: "annualContribution", label: "Annual contribution", kind: "currency", defaultValue: "", required: true },
    { name: "annualReturn", label: "Expected annual return (%)", kind: "percentage", defaultValue: "7", required: true },
  ],
  advancedInputs: [
    { name: "retirementTaxRate", label: "Estimated tax rate at withdrawal (%)", kind: "percentage", defaultValue: "", required: false, helpText: "Enter to see an estimated after-tax balance." },
  ],
  schema: iraSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Balance = Current balance × (1 + i)ⁿ + Monthly contribution × [((1 + i)ⁿ − 1) ÷ i]. After-tax balance = Pre-tax balance × (1 − tax rate).",
  explanation: [
    {
      heading: "Traditional vs. Roth",
      body: "A traditional IRA gives you a tax deduction now and taxes withdrawals later. Compare against the Roth IRA Calculator, which taxes contributions now but never taxes qualified withdrawals.",
    },
  ],
  faq: [
    { q: "Why estimate a withdrawal tax rate?", a: "Traditional IRA withdrawals are taxed as ordinary income, so your actual take-home amount in retirement depends on your tax bracket at that time." },
  ],
  related: ["roth-ira", "401k", "retirement"],
};
