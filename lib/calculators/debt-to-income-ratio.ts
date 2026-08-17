import { Scale } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";
import { Decimal, toRounded } from "../decimal-utils";

export const debtToIncomeRatioSchema = z.object({
  monthlyDebtPayments: numberField({ label: "Total monthly debt payments", min: 0, max: 10_000_000 }),
  grossMonthlyIncome: numberField({ label: "Gross monthly income", min: 0.01, max: 10_000_000 }),
});

export type DebtToIncomeRatioValues = z.infer<typeof debtToIncomeRatioSchema>;

function calculate(values: DebtToIncomeRatioValues): CalcResult {
  const debt = new Decimal(values.monthlyDebtPayments);
  const income = new Decimal(values.grossMonthlyIncome);
  const dti = debt.dividedBy(income).times(100);
  const dtiNum = toRounded(dti);

  let rating: string;
  if (dtiNum <= 36) rating = "Generally considered healthy";
  else if (dtiNum <= 43) rating = "Manageable, but at the edge many lenders accept";
  else rating = "High — may limit loan approval or terms";

  return {
    primary: { key: "dti", label: "Debt-to-income ratio", value: dtiNum, format: "percentage" },
    secondary: [
      { key: "monthlyDebtPayments", label: "Monthly debt payments", value: toRounded(debt), format: "currency" },
      { key: "grossMonthlyIncome", label: "Gross monthly income", value: toRounded(income), format: "currency" },
    ],
    notes: [rating],
  };
}

export const debtToIncomeRatioCalculator: CalculatorDef = {
  id: "debt-to-income-ratio",
  slug: "debt-to-income-ratio",
  title: "Debt-to-Income Ratio Calculator",
  description: "Calculate your DTI ratio, a key figure lenders use to evaluate loan applications.",
  category: "finance",
  icon: Scale,
  keywords: ["dti", "debt to income", "loan qualification", "mortgage qualification"],
  inputs: [
    { name: "monthlyDebtPayments", label: "Total monthly debt payments", kind: "currency", defaultValue: "", required: true, helpText: "Include minimum payments on loans, credit cards, and rent/mortgage." },
    { name: "grossMonthlyIncome", label: "Gross monthly income", kind: "currency", defaultValue: "", required: true },
  ],
  schema: debtToIncomeRatioSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "DTI = Total monthly debt payments ÷ Gross monthly income × 100.",
  explanation: [
    {
      heading: "Why lenders care about DTI",
      body: "DTI shows how much of your income is already committed to debt. Many mortgage lenders prefer a DTI at or below 36-43%, though exact thresholds vary by loan type and lender.",
    },
  ],
  faq: [
    { q: "Should I use gross or net income?", a: "Lenders typically calculate DTI using gross (pre-tax) income, not your take-home pay." },
  ],
  related: ["house-affordability", "budget", "debt-payoff"],
};
