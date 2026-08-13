import { Banknote } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";
import { Decimal, buildAmortizationSchedule, monthlyPayment, toMoney } from "../decimal-utils";

export const loanSchema = z.object({
  principal: numberField({ label: "Loan amount", min: 1, max: 1_000_000_000 }),
  interestRate: numberField({ label: "Interest rate", min: 0, max: 100 }),
  termYears: numberField({ label: "Loan term", min: 1, max: 40 }),
  extraPayment: numberField({ label: "Extra monthly payment", min: 0, max: 1_000_000, required: false }),
});

export type LoanValues = z.infer<typeof loanSchema>;

function calculate(values: LoanValues): CalcResult {
  const principal = new Decimal(values.principal);
  const annualRate = new Decimal(values.interestRate).dividedBy(100);
  const monthlyRate = annualRate.dividedBy(12);
  const numPayments = Math.round(values.termYears * 12);
  const extra = new Decimal(values.extraPayment ?? 0);

  const basePayment = monthlyPayment(principal, monthlyRate, numPayments);
  const totalPayment = basePayment.plus(extra);

  const schedule = buildAmortizationSchedule(principal, monthlyRate, numPayments, totalPayment);
  const actualNumPayments = schedule.length;
  const totalPaid = schedule.reduce((sum, row) => sum.plus(row.payment), new Decimal(0));
  const totalInterest = schedule.reduce((sum, row) => sum.plus(row.interest), new Decimal(0));

  const monthsSaved = extra.greaterThan(0) ? numPayments - actualNumPayments : 0;

  return {
    primary: {
      key: "monthlyPayment",
      label: "Monthly payment",
      value: toMoney(basePayment.plus(extra)),
      format: "currency",
    },
    secondary: [
      { key: "principal", label: "Loan amount", value: toMoney(principal), format: "currency" },
      { key: "totalInterest", label: "Total interest", value: toMoney(totalInterest), format: "currency" },
      { key: "totalPaid", label: "Total paid", value: toMoney(totalPaid), format: "currency" },
      { key: "payoffMonths", label: "Payoff time (months)", value: actualNumPayments, format: "number" },
      ...(monthsSaved > 0
        ? [{ key: "monthsSaved", label: "Months saved with extra payments", value: monthsSaved, format: "number" as const }]
        : []),
    ],
    table: schedule,
  };
}

export const loanCalculator: CalculatorDef = {
  id: "loan",
  slug: "loan",
  title: "Loan Calculator",
  description: "Calculate monthly payment, total interest, and payoff time for any fixed-rate loan.",
  category: "finance",
  icon: Banknote,
  keywords: ["loan payment", "personal loan", "auto loan", "car loan", "amortization", "payment"],
  inputs: [
    { name: "principal", label: "Loan amount", kind: "currency", defaultValue: "", required: true },
    { name: "interestRate", label: "Interest rate (annual %)", kind: "percentage", defaultValue: "", required: true },
    { name: "termYears", label: "Loan term (years)", kind: "number", defaultValue: "5", min: 1, max: 40, step: 1, required: true },
  ],
  advancedInputs: [
    { name: "extraPayment", label: "Extra monthly payment", kind: "currency", defaultValue: "0", required: false },
  ],
  schema: loanSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "M = P × r ÷ (1 − (1 + r)⁻ⁿ), where P is principal, r is the monthly interest rate, and n is the number of monthly payments.",
  explanation: [
    {
      heading: "Decimal-safe amortization",
      body: "Payments are computed with arbitrary-precision decimal arithmetic (not floating point) and amortized month by month so rounding never drifts over the life of the loan.",
    },
  ],
  faq: [
    { q: "How does an extra payment help?", a: "Extra payments reduce the principal faster, which shortens the payoff time and reduces total interest paid." },
  ],
  related: ["mortgage", "compound-interest"],
};
