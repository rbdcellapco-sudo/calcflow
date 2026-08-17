import { Briefcase } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";
import { Decimal, toMoney } from "../decimal-utils";

export const pensionSchema = z.object({
  yearsOfService: numberField({ label: "Years of service", min: 0, max: 60 }),
  accrualRate: numberField({ label: "Accrual rate", min: 0, max: 10 }),
  finalAverageSalary: numberField({ label: "Final average salary", min: 0, max: 1_000_000_000 }),
});

export type PensionValues = z.infer<typeof pensionSchema>;

function calculate(values: PensionValues): CalcResult {
  const salary = new Decimal(values.finalAverageSalary);
  const rate = new Decimal(values.accrualRate).dividedBy(100);
  const years = new Decimal(values.yearsOfService);

  const annualBenefit = salary.times(rate).times(years);
  const monthlyBenefit = annualBenefit.dividedBy(12);
  const replacementRatio = annualBenefit.dividedBy(salary).times(100);

  return {
    primary: { key: "annualBenefit", label: "Estimated annual pension", value: toMoney(annualBenefit), format: "currency" },
    secondary: [
      { key: "monthlyBenefit", label: "Estimated monthly pension", value: toMoney(monthlyBenefit), format: "currency" },
      { key: "replacementRatio", label: "Income replacement ratio", value: toMoney(replacementRatio), format: "percentage" },
    ],
    notes: ["This uses a generic defined-benefit formula. Your actual plan's accrual rate, vesting rules, and salary averaging period may differ — check your plan document for exact terms."],
  };
}

export const pensionCalculator: CalculatorDef = {
  id: "pension",
  slug: "pension",
  title: "Pension Calculator",
  description: "Estimate a defined-benefit pension payout from years of service and final average salary.",
  category: "finance",
  icon: Briefcase,
  keywords: ["pension", "defined benefit", "final salary", "accrual rate"],
  inputs: [
    { name: "yearsOfService", label: "Years of service", kind: "number", defaultValue: "20", min: 0, max: 60, step: 1, required: true },
    { name: "accrualRate", label: "Accrual rate (% per year of service)", kind: "percentage", defaultValue: "1.5", min: 0, max: 10, step: 0.1, required: true },
    { name: "finalAverageSalary", label: "Final average salary", kind: "currency", defaultValue: "", required: true },
  ],
  schema: pensionSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Annual pension = Final average salary × Accrual rate × Years of service.",
  explanation: [
    {
      heading: "How defined-benefit pensions work",
      body: "Unlike a 401(k), a defined-benefit pension promises a set income based on a formula, typically your salary and years worked, rather than depending on investment performance.",
    },
  ],
  faq: [
    { q: "What's a typical accrual rate?", a: "Many pension plans use accrual rates between 1% and 2.5% per year of service, but this varies widely by employer and plan type." },
  ],
  related: ["retirement", "social-security", "annuity"],
};
