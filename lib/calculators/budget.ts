import { Wallet2 } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";
import { Decimal, toMoney } from "../decimal-utils";

export const budgetSchema = z.object({
  monthlyIncome: numberField({ label: "Monthly take-home income", min: 0.01, max: 1_000_000_000 }),
  needsSpending: numberField({ label: "Actual needs spending", min: 0, max: 1_000_000_000, required: false }),
  wantsSpending: numberField({ label: "Actual wants spending", min: 0, max: 1_000_000_000, required: false }),
  savingsAmount: numberField({ label: "Actual savings", min: 0, max: 1_000_000_000, required: false }),
});

export type BudgetValues = z.infer<typeof budgetSchema>;

function calculate(values: BudgetValues): CalcResult {
  const income = new Decimal(values.monthlyIncome);
  const targetNeeds = income.times(0.5);
  const targetWants = income.times(0.3);
  const targetSavings = income.times(0.2);

  const secondary = [
    { key: "targetNeeds", label: "Needs target (50%)", value: toMoney(targetNeeds), format: "currency" as const },
    { key: "targetWants", label: "Wants target (30%)", value: toMoney(targetWants), format: "currency" as const },
    { key: "targetSavings", label: "Savings target (20%)", value: toMoney(targetSavings), format: "currency" as const },
  ];

  const needs = values.needsSpending;
  const wants = values.wantsSpending;
  const savings = values.savingsAmount;
  if (needs !== undefined || wants !== undefined || savings !== undefined) {
    const totalActual = new Decimal(needs ?? 0).plus(wants ?? 0).plus(savings ?? 0);
    const remaining = income.minus(totalActual);
    secondary.push({ key: "totalActual", label: "Total actual spending + savings", value: toMoney(totalActual), format: "currency" as const });
    secondary.push({ key: "remaining", label: remaining.greaterThanOrEqualTo(0) ? "Unallocated income" : "Over budget by", value: toMoney(remaining.abs()), format: "currency" as const });
  }

  return {
    primary: { key: "monthlyIncome", label: "Monthly income", value: toMoney(income), format: "currency" },
    secondary,
  };
}

export const budgetCalculator: CalculatorDef = {
  id: "budget",
  slug: "budget",
  title: "Budget Calculator",
  description: "Apply the 50/30/20 rule to your income and compare it against your actual spending.",
  category: "finance",
  icon: Wallet2,
  keywords: ["budget", "50/30/20 rule", "needs wants savings", "monthly budget"],
  inputs: [
    { name: "monthlyIncome", label: "Monthly take-home income", kind: "currency", defaultValue: "", required: true },
  ],
  advancedInputs: [
    { name: "needsSpending", label: "Actual needs spending", kind: "currency", defaultValue: "", required: false, helpText: "Housing, groceries, utilities, minimum debt payments, etc." },
    { name: "wantsSpending", label: "Actual wants spending", kind: "currency", defaultValue: "", required: false, helpText: "Dining out, entertainment, subscriptions, etc." },
    { name: "savingsAmount", label: "Actual savings", kind: "currency", defaultValue: "", required: false },
  ],
  schema: budgetSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "50/30/20 rule: 50% of income to needs, 30% to wants, 20% to savings and debt repayment beyond minimums.",
  explanation: [
    {
      heading: "A starting framework, not a strict rule",
      body: "The 50/30/20 split is a popular guideline for balancing a budget, but your ideal split depends on your cost of living, debt situation, and goals.",
    },
  ],
  faq: [
    { q: "What counts as a 'need' vs. a 'want'?", a: "Needs are typically non-negotiable essentials like housing, utilities, groceries, and minimum debt payments. Wants are discretionary spending you could cut without major life disruption." },
  ],
  related: ["debt-to-income-ratio", "rent", "salary"],
};
