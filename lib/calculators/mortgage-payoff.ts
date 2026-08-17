import { Flag } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";
import { Decimal, buildAmortizationSchedule, monthlyPayment, toMoney } from "../decimal-utils";

export const mortgagePayoffSchema = z.object({
  currentBalance: numberField({ label: "Current mortgage balance", min: 1, max: 1_000_000_000 }),
  interestRate: numberField({ label: "Interest rate", min: 0, max: 100 }),
  remainingTermYears: numberField({ label: "Remaining term", min: 0.1, max: 40 }),
  extraMonthlyPayment: numberField({ label: "Extra monthly payment", min: 0, max: 1_000_000, required: false }),
});

export type MortgagePayoffValues = z.infer<typeof mortgagePayoffSchema>;

function calculate(values: MortgagePayoffValues): CalcResult {
  const balance = new Decimal(values.currentBalance);
  const monthlyRate = new Decimal(values.interestRate).dividedBy(100).dividedBy(12);
  const originalMonths = Math.round(values.remainingTermYears * 12);
  const extra = new Decimal(values.extraMonthlyPayment ?? 0);

  const originalPayment = monthlyPayment(balance, monthlyRate, originalMonths);
  const newPayment = originalPayment.plus(extra);

  const schedule = buildAmortizationSchedule(balance, monthlyRate, originalMonths, newPayment);
  const actualMonths = schedule.length;
  const monthsSaved = originalMonths - actualMonths;

  const totalInterestOriginal = originalPayment.times(originalMonths).minus(balance);
  const totalInterestNew = schedule.reduce((sum, row) => sum.plus(row.interest), new Decimal(0));
  const interestSaved = totalInterestOriginal.minus(totalInterestNew);

  return {
    primary: { key: "monthsSaved", label: "Months saved", value: monthsSaved, format: "number" },
    secondary: [
      { key: "newPayoffMonths", label: "New payoff time (months)", value: actualMonths, format: "number" },
      { key: "interestSaved", label: "Interest saved", value: toMoney(interestSaved), format: "currency" },
      { key: "newPayment", label: "New monthly payment", value: toMoney(newPayment), format: "currency" },
    ],
    table: schedule,
  };
}

export const mortgagePayoffCalculator: CalculatorDef = {
  id: "mortgage-payoff",
  slug: "mortgage-payoff",
  title: "Mortgage Payoff Calculator",
  description: "See how much time and interest you'd save by paying extra toward your mortgage each month.",
  category: "finance",
  icon: Flag,
  keywords: ["mortgage payoff", "early payoff", "extra mortgage payment", "pay off mortgage early"],
  inputs: [
    { name: "currentBalance", label: "Current mortgage balance", kind: "currency", defaultValue: "", required: true },
    { name: "interestRate", label: "Interest rate (annual %)", kind: "percentage", defaultValue: "", required: true },
    { name: "remainingTermYears", label: "Remaining term (years)", kind: "number", defaultValue: "25", min: 0.1, max: 40, step: 0.5, required: true },
    { name: "extraMonthlyPayment", label: "Extra monthly payment", kind: "currency", defaultValue: "100", required: true },
  ],
  schema: mortgagePayoffSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Extra payments reduce principal faster each month, shortening the amortization schedule and reducing total interest paid.",
  explanation: [
    {
      heading: "Even small extra payments add up",
      body: "Because mortgage interest compounds on a shrinking balance, extra principal payments early in the loan have an outsized effect on total interest paid over the life of the loan.",
    },
  ],
  faq: [
    { q: "Should I pay off my mortgage early?", a: "It depends on your mortgage rate versus what you could earn investing that money elsewhere, plus how much you value being debt-free." },
  ],
  related: ["mortgage", "refinance", "loan"],
};
