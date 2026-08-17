import { Wallet } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";
import { Decimal, toMoney } from "../decimal-utils";

const FREQUENCIES = ["annually", "monthly", "biweekly", "weekly"] as const;
const PERIODS_PER_YEAR: Record<(typeof FREQUENCIES)[number], number> = {
  annually: 1,
  monthly: 12,
  biweekly: 26,
  weekly: 52,
};

export const salarySchema = z.object({
  grossAnnualSalary: numberField({ label: "Gross annual salary", min: 0, max: 1_000_000_000 }),
  preTaxDeductionsAnnual: numberField({ label: "Pre-tax deductions", min: 0, max: 1_000_000_000, required: false }),
  estimatedTaxRate: numberField({ label: "Estimated effective tax rate", min: 0, max: 100 }),
  payFrequency: selectField(FREQUENCIES, "Pay frequency"),
});

export type SalaryValues = z.infer<typeof salarySchema>;

function calculate(values: SalaryValues): CalcResult {
  const gross = new Decimal(values.grossAnnualSalary);
  const preTaxDeductions = new Decimal(values.preTaxDeductionsAnnual ?? 0);
  const taxableIncome = Decimal.max(gross.minus(preTaxDeductions), 0);
  const tax = taxableIncome.times(new Decimal(values.estimatedTaxRate).dividedBy(100));
  const netAnnual = taxableIncome.minus(tax);

  const periods = PERIODS_PER_YEAR[values.payFrequency];
  const netPerPaycheck = netAnnual.dividedBy(periods);

  return {
    primary: { key: "netPerPaycheck", label: "Net pay per paycheck", value: toMoney(netPerPaycheck), format: "currency" },
    secondary: [
      { key: "netAnnual", label: "Net annual pay", value: toMoney(netAnnual), format: "currency" },
      { key: "tax", label: "Estimated tax", value: toMoney(tax), format: "currency" },
      { key: "grossAnnual", label: "Gross annual salary", value: toMoney(gross), format: "currency" },
    ],
    notes: ["Uses a single effective tax rate you supply rather than modeling specific tax brackets — for a bracket-based estimate, use the Income Tax Calculator."],
  };
}

export const salaryCalculator: CalculatorDef = {
  id: "salary",
  slug: "salary",
  title: "Salary & Take-Home Pay Calculator",
  description: "Convert a gross salary into take-home pay per paycheck, after tax and deductions.",
  category: "finance",
  icon: Wallet,
  keywords: ["take home pay", "net salary", "paycheck calculator", "gross to net"],
  inputs: [
    { name: "grossAnnualSalary", label: "Gross annual salary", kind: "currency", defaultValue: "", required: true },
    { name: "estimatedTaxRate", label: "Estimated effective tax rate (%)", kind: "percentage", defaultValue: "", required: true },
    {
      name: "payFrequency",
      label: "Pay frequency",
      kind: "select",
      defaultValue: "monthly",
      options: [
        { value: "annually", label: "Annually" },
        { value: "monthly", label: "Monthly" },
        { value: "biweekly", label: "Biweekly" },
        { value: "weekly", label: "Weekly" },
      ],
    },
  ],
  advancedInputs: [
    { name: "preTaxDeductionsAnnual", label: "Pre-tax deductions (retirement, insurance, etc.)", kind: "currency", defaultValue: "0", required: false },
  ],
  schema: salarySchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Taxable income = Gross − Pre-tax deductions. Net pay = Taxable income × (1 − tax rate), divided across pay periods.",
  explanation: [
    {
      heading: "Effective rate, not marginal rate",
      body: "Enter your overall effective tax rate (total tax ÷ total income), not your top marginal bracket rate, for the most accurate take-home estimate.",
    },
  ],
  faq: [
    { q: "What counts as a pre-tax deduction?", a: "Common examples include retirement account contributions (like a 401(k) or EPF) and employer-sponsored health insurance premiums." },
  ],
  related: ["income-tax", "budget", "401k"],
};
