import { Home } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";
import { Decimal, monthlyPayment, toMoney, toRounded } from "../decimal-utils";

export const homeEquityLoanSchema = z.object({
  homeValue: numberField({ label: "Home value", min: 1, max: 1_000_000_000 }),
  existingMortgageBalance: numberField({ label: "Existing mortgage balance", min: 0, max: 1_000_000_000 }),
  loanAmount: numberField({ label: "Home equity loan amount", min: 1, max: 1_000_000_000 }),
  interestRate: numberField({ label: "Interest rate", min: 0, max: 100 }),
  termYears: numberField({ label: "Loan term (years)", min: 0.1, max: 40 }),
});

export type HomeEquityLoanValues = z.infer<typeof homeEquityLoanSchema>;

function calculate(values: HomeEquityLoanValues): CalcResult {
  const homeValue = new Decimal(values.homeValue);
  const existingBalance = new Decimal(values.existingMortgageBalance);
  const loanAmount = new Decimal(values.loanAmount);
  const monthlyRate = new Decimal(values.interestRate).dividedBy(100).dividedBy(12);
  const numPayments = Math.round(values.termYears * 12);

  const payment = monthlyPayment(loanAmount, monthlyRate, numPayments);
  const totalPaid = payment.times(numPayments);
  const totalInterest = totalPaid.minus(loanAmount);
  const combinedLtv = existingBalance.plus(loanAmount).dividedBy(homeValue).times(100);
  const availableEquity = homeValue.minus(existingBalance);

  return {
    primary: { key: "monthlyPayment", label: "Monthly payment", value: toMoney(payment), format: "currency" },
    secondary: [
      { key: "totalInterest", label: "Total interest", value: toMoney(totalInterest), format: "currency" },
      { key: "availableEquity", label: "Equity before this loan", value: toMoney(availableEquity), format: "currency" },
      { key: "combinedLtv", label: "Combined loan-to-value", value: toRounded(combinedLtv), format: "percentage" },
    ],
    notes: combinedLtv.greaterThan(85) ? ["A combined loan-to-value above ~85% may be difficult to qualify for with many lenders."] : undefined,
  };
}

export const homeEquityLoanCalculator: CalculatorDef = {
  id: "home-equity-loan",
  slug: "home-equity-loan",
  title: "Home Equity Loan Calculator",
  description: "Calculate payments on a home equity loan and see your resulting combined loan-to-value.",
  category: "finance",
  icon: Home,
  keywords: ["home equity loan", "second mortgage", "heloan", "combined ltv"],
  inputs: [
    { name: "homeValue", label: "Home value", kind: "currency", defaultValue: "", required: true },
    { name: "existingMortgageBalance", label: "Existing mortgage balance", kind: "currency", defaultValue: "", required: true },
    { name: "loanAmount", label: "Home equity loan amount", kind: "currency", defaultValue: "", required: true },
    { name: "interestRate", label: "Interest rate (annual %)", kind: "percentage", defaultValue: "", required: true },
    { name: "termYears", label: "Loan term (years)", kind: "number", defaultValue: "15", min: 0.1, max: 40, step: 1, required: true },
  ],
  schema: homeEquityLoanSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "M = P × r ÷ (1 − (1 + r)⁻ⁿ). Combined LTV = (Existing mortgage + New loan) ÷ Home value.",
  explanation: [
    {
      heading: "Fixed lump sum, unlike a HELOC",
      body: "A home equity loan gives you a single lump sum with a fixed rate and payment, unlike a HELOC's revolving credit line with a variable rate.",
    },
  ],
  faq: [
    { q: "How much can I typically borrow?", a: "Many lenders cap combined loan-to-value around 80-90%, meaning your existing mortgage plus the new loan can't exceed that share of your home's value." },
  ],
  related: ["heloc", "mortgage", "down-payment"],
};
