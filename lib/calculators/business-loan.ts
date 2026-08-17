import { Store } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";
import { Decimal, monthlyPayment, toMoney } from "../decimal-utils";

export const businessLoanSchema = z.object({
  loanAmount: numberField({ label: "Loan amount", min: 1, max: 1_000_000_000 }),
  interestRate: numberField({ label: "Interest rate", min: 0, max: 100 }),
  termYears: numberField({ label: "Loan term (years)", min: 0.1, max: 40 }),
  originationFeePercent: numberField({ label: "Origination fee", min: 0, max: 20, required: false }),
});

export type BusinessLoanValues = z.infer<typeof businessLoanSchema>;

function calculate(values: BusinessLoanValues): CalcResult {
  const loanAmount = new Decimal(values.loanAmount);
  const monthlyRate = new Decimal(values.interestRate).dividedBy(100).dividedBy(12);
  const numPayments = Math.round(values.termYears * 12);

  const payment = monthlyPayment(loanAmount, monthlyRate, numPayments);
  const totalPaid = payment.times(numPayments);
  const totalInterest = totalPaid.minus(loanAmount);

  const feePercent = new Decimal(values.originationFeePercent ?? 0);
  const fee = loanAmount.times(feePercent).dividedBy(100);
  const netProceeds = loanAmount.minus(fee);

  const secondary = [
    { key: "totalInterest", label: "Total interest", value: toMoney(totalInterest), format: "currency" as const },
    { key: "totalPaid", label: "Total paid", value: toMoney(totalPaid), format: "currency" as const },
  ];
  if (feePercent.greaterThan(0)) {
    secondary.push({ key: "originationFee", label: "Origination fee", value: toMoney(fee), format: "currency" as const });
    secondary.push({ key: "netProceeds", label: "Net proceeds received", value: toMoney(netProceeds), format: "currency" as const });
  }

  return {
    primary: { key: "monthlyPayment", label: "Monthly payment", value: toMoney(payment), format: "currency" },
    secondary,
  };
}

export const businessLoanCalculator: CalculatorDef = {
  id: "business-loan",
  slug: "business-loan",
  title: "Business Loan Calculator",
  description: "Calculate monthly payments, total interest, and net proceeds after origination fees.",
  category: "finance",
  icon: Store,
  keywords: ["business loan", "commercial loan", "sba loan", "origination fee"],
  inputs: [
    { name: "loanAmount", label: "Loan amount", kind: "currency", defaultValue: "", required: true },
    { name: "interestRate", label: "Interest rate (annual %)", kind: "percentage", defaultValue: "", required: true },
    { name: "termYears", label: "Loan term (years)", kind: "number", defaultValue: "5", min: 0.1, max: 40, step: 0.5, required: true },
  ],
  advancedInputs: [
    { name: "originationFeePercent", label: "Origination fee (% of loan)", kind: "percentage", defaultValue: "0", required: false },
  ],
  schema: businessLoanSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "M = P × r ÷ (1 − (1 + r)⁻ⁿ). Net proceeds = Loan amount − Origination fee.",
  explanation: [
    {
      heading: "Origination fees reduce what you actually receive",
      body: "You repay the full loan amount, but an origination fee is typically deducted upfront, so the cash you actually receive is less than the loan amount.",
    },
  ],
  faq: [
    { q: "What's a typical origination fee?", a: "Business loan origination fees commonly range from 0% to 5% of the loan amount, depending on the lender and loan type." },
  ],
  related: ["loan", "refinance", "debt-to-income-ratio"],
};
