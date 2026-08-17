import { Building2 } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";
import { Decimal, toMoney } from "../decimal-utils";

export const k401Schema = z.object({
  currentAge: numberField({ label: "Current age", min: 1, max: 100, integer: true }),
  retirementAge: numberField({ label: "Retirement age", min: 1, max: 100, integer: true }),
  currentBalance: numberField({ label: "Current 401(k) balance", min: 0, max: 1_000_000_000 }),
  annualSalary: numberField({ label: "Annual salary", min: 0, max: 1_000_000_000 }),
  contributionPercent: numberField({ label: "Your contribution", min: 0, max: 100 }),
  employerMatchPercent: numberField({ label: "Employer match", min: 0, max: 100, required: false }),
  employerMatchCap: numberField({ label: "Employer match cap (% of salary)", min: 0, max: 100, required: false }),
  annualReturn: numberField({ label: "Expected annual return", min: 0, max: 100 }),
});

export type K401Values = z.infer<typeof k401Schema>;

function calculate(values: K401Values): CalcResult {
  const salary = new Decimal(values.annualSalary);
  const employeeAnnual = salary.times(new Decimal(values.contributionPercent).dividedBy(100));

  const matchPercent = new Decimal(values.employerMatchPercent ?? 0).dividedBy(100);
  const matchableContributionPercent = Math.min(values.contributionPercent, values.employerMatchCap ?? 0);
  const employerAnnual = matchPercent.greaterThan(0)
    ? salary.times(new Decimal(matchableContributionPercent).dividedBy(100)).times(matchPercent)
    : new Decimal(0);

  const totalAnnualContribution = employeeAnnual.plus(employerAnnual);
  const monthlyContribution = totalAnnualContribution.dividedBy(12);
  const monthlyRate = new Decimal(values.annualReturn).dividedBy(100).dividedBy(12);
  const months = Math.round((values.retirementAge - values.currentAge) * 12);

  const currentBalance = new Decimal(values.currentBalance);
  const growth = monthlyRate.plus(1).pow(months);
  const fvBalance = currentBalance.times(growth);
  const fvContributions = monthlyRate.isZero()
    ? monthlyContribution.times(months)
    : monthlyContribution.times(growth.minus(1).dividedBy(monthlyRate));

  const balanceAtRetirement = fvBalance.plus(fvContributions);
  const totalEmployeeContributed = employeeAnnual.times(values.retirementAge - values.currentAge);
  const totalEmployerContributed = employerAnnual.times(values.retirementAge - values.currentAge);

  return {
    primary: { key: "balanceAtRetirement", label: `Balance at age ${values.retirementAge}`, value: toMoney(balanceAtRetirement), format: "currency" },
    secondary: [
      { key: "totalEmployeeContributed", label: "Your total contributions", value: toMoney(totalEmployeeContributed), format: "currency" },
      { key: "totalEmployerContributed", label: "Employer match total", value: toMoney(totalEmployerContributed), format: "currency" },
      { key: "annualContribution", label: "Combined annual contribution", value: toMoney(totalAnnualContribution), format: "currency" },
    ],
    notes: ["Annual IRS contribution limits aren't enforced here since they change yearly — check the current limit at irs.gov before relying on this for tax planning."],
  };
}

export const k401Calculator: CalculatorDef = {
  id: "401k",
  slug: "401k",
  title: "401(k) Calculator",
  description: "Project your 401(k) balance at retirement, including employer matching.",
  category: "finance",
  icon: Building2,
  region: "US",
  keywords: ["401k", "employer match", "retirement account", "workplace retirement"],
  inputs: [
    { name: "currentAge", label: "Current age", kind: "number", defaultValue: "30", min: 1, max: 100, step: 1, required: true },
    { name: "retirementAge", label: "Retirement age", kind: "number", defaultValue: "65", min: 1, max: 100, step: 1, required: true },
    { name: "currentBalance", label: "Current 401(k) balance", kind: "currency", defaultValue: "0", required: true },
    { name: "annualSalary", label: "Annual salary", kind: "currency", defaultValue: "", required: true },
    { name: "contributionPercent", label: "Your contribution (% of salary)", kind: "percentage", defaultValue: "6", required: true },
    { name: "annualReturn", label: "Expected annual return (%)", kind: "percentage", defaultValue: "7", required: true },
  ],
  advancedInputs: [
    { name: "employerMatchPercent", label: "Employer match (% of contribution matched)", kind: "percentage", defaultValue: "50", required: false, helpText: "e.g. 50 means the employer contributes 50 cents per dollar you contribute." },
    { name: "employerMatchCap", label: "Employer match cap (% of salary)", kind: "percentage", defaultValue: "6", required: false, helpText: "The employer stops matching beyond this percentage of your salary." },
  ],
  schema: k401Schema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Balance = Current balance × (1 + i)ⁿ + Monthly contribution × [((1 + i)ⁿ − 1) ÷ i], where the monthly contribution combines your deferral and any matched employer contribution.",
  explanation: [
    {
      heading: "Don't leave the match on the table",
      body: "Employer matching is effectively free money up to the match cap. Contributing at least enough to get the full match is usually one of the highest-return moves available.",
    },
  ],
  faq: [
    { q: "Is this specific to a country?", a: "401(k) plans are a US workplace retirement structure. This calculator doesn't model contribution limits, which change annually and vary by age." },
  ],
  related: ["retirement", "ira", "roth-ira"],
};
