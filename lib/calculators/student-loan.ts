import { GraduationCap } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";
import { Decimal, monthlyPayment, toMoney } from "../decimal-utils";

export const studentLoanSchema = z.object({
  loanAmount: numberField({ label: "Loan amount", min: 1, max: 10_000_000 }),
  interestRate: numberField({ label: "Interest rate", min: 0, max: 100 }),
  termYears: numberField({ label: "Repayment term (years)", min: 1, max: 30 }),
  gracePeriodMonths: numberField({ label: "Grace period before repayment starts", min: 0, max: 60, required: false }),
});

export type StudentLoanValues = z.infer<typeof studentLoanSchema>;

function calculate(values: StudentLoanValues): CalcResult {
  const loanAmount = new Decimal(values.loanAmount);
  const monthlyRate = new Decimal(values.interestRate).dividedBy(100).dividedBy(12);
  const graceMonths = values.gracePeriodMonths ?? 0;

  const accruedDuringGrace = loanAmount.times(monthlyRate).times(graceMonths);
  const principalAtRepayment = loanAmount.plus(accruedDuringGrace);

  const numPayments = Math.round(values.termYears * 12);
  const payment = monthlyPayment(principalAtRepayment, monthlyRate, numPayments);
  const totalPaid = payment.times(numPayments);
  const totalInterest = totalPaid.minus(loanAmount);

  const secondary = [
    { key: "totalInterest", label: "Total interest", value: toMoney(totalInterest), format: "currency" as const },
    { key: "totalPaid", label: "Total paid", value: toMoney(totalPaid), format: "currency" as const },
  ];
  if (graceMonths > 0) {
    secondary.push({ key: "accruedDuringGrace", label: "Interest accrued during grace period", value: toMoney(accruedDuringGrace), format: "currency" as const });
  }

  return {
    primary: { key: "monthlyPayment", label: "Monthly payment", value: toMoney(payment), format: "currency" },
    secondary,
  };
}

export const studentLoanCalculator: CalculatorDef = {
  id: "student-loan",
  slug: "student-loan",
  title: "Student Loan Calculator",
  description: "Calculate student loan payments, including interest that accrues during a grace period.",
  category: "finance",
  icon: GraduationCap,
  keywords: ["student loan", "grace period", "loan repayment", "education loan"],
  inputs: [
    { name: "loanAmount", label: "Loan amount", kind: "currency", defaultValue: "", required: true },
    { name: "interestRate", label: "Interest rate (annual %)", kind: "percentage", defaultValue: "", required: true },
    { name: "termYears", label: "Repayment term (years)", kind: "number", defaultValue: "10", min: 1, max: 30, step: 1, required: true },
  ],
  advancedInputs: [
    { name: "gracePeriodMonths", label: "Grace period before repayment starts (months)", kind: "number", defaultValue: "6", min: 0, max: 60, step: 1, required: false, helpText: "Interest that accrues during this period is added to your balance." },
  ],
  schema: studentLoanSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Interest accrued during the grace period is capitalized (added to the principal) before the standard amortizing payment is calculated.",
  explanation: [
    {
      heading: "Capitalized interest raises your real balance",
      body: "Even though you're not making payments during a grace period, interest often keeps accruing. Once it's added to your principal, you pay interest on that interest too.",
    },
  ],
  faq: [
    { q: "Does this cover income-driven repayment plans?", a: "No — this assumes a standard fixed monthly payment over a fixed term, not an income-based plan." },
  ],
  related: ["college-cost", "loan", "debt-payoff"],
};
