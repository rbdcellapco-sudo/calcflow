import { Percent } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";
import { Decimal, monthlyPayment, toMoney, toRounded } from "../decimal-utils";

export const aprSchema = z.object({
  loanAmount: numberField({ label: "Loan amount", min: 1, max: 1_000_000_000 }),
  interestRate: numberField({ label: "Stated (nominal) interest rate", min: 0, max: 100 }),
  fees: numberField({ label: "Fees (points, origination, closing costs)", min: 0, max: 1_000_000 }),
  termYears: numberField({ label: "Loan term (years)", min: 0.1, max: 40 }),
});

export type AprValues = z.infer<typeof aprSchema>;

/** Plain-number monthly payment for a given principal/rate/term, used inside the root-finder. */
function paymentFor(principal: number, periodicRate: number, n: number): number {
  if (periodicRate === 0) return principal / n;
  const onePlusR = 1 + periodicRate;
  return (principal * periodicRate) / (1 - Math.pow(onePlusR, -n));
}

function calculate(values: AprValues): CalcResult {
  const loanAmount = new Decimal(values.loanAmount);
  const nominalMonthlyRate = new Decimal(values.interestRate).dividedBy(100).dividedBy(12);
  const numPayments = Math.round(values.termYears * 12);
  const fees = new Decimal(values.fees);

  const payment = monthlyPayment(loanAmount, nominalMonthlyRate, numPayments);
  const netProceeds = loanAmount.minus(fees).toNumber();
  const targetPayment = payment.toNumber();

  // Bisect for the periodic rate that makes the net proceeds amortize at the same payment.
  let lo = 0;
  let hi = Math.max(nominalMonthlyRate.toNumber() * 5, 0.05);
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const p = paymentFor(netProceeds, mid, numPayments);
    if (p < targetPayment) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  const aprMonthlyRate = (lo + hi) / 2;
  const apr = new Decimal(aprMonthlyRate * 12 * 100);

  return {
    primary: { key: "apr", label: "APR", value: toRounded(apr, 3), format: "percentage" },
    secondary: [
      { key: "statedRate", label: "Stated (nominal) rate", value: values.interestRate, format: "percentage" },
      { key: "netProceeds", label: "Net amount received after fees", value: toMoney(new Decimal(netProceeds)), format: "currency" },
      { key: "monthlyPayment", label: "Monthly payment", value: toMoney(payment), format: "currency" },
    ],
    notes: ["APR reflects the true cost of borrowing, including fees, expressed as an annualized rate. It's always at or above the stated interest rate whenever fees are financed."],
  };
}

export const aprCalculator: CalculatorDef = {
  id: "apr",
  slug: "apr",
  title: "APR Calculator",
  description: "Calculate the true annual percentage rate of a loan once fees are factored in.",
  category: "finance",
  icon: Percent,
  keywords: ["apr", "annual percentage rate", "true cost of borrowing", "loan fees"],
  inputs: [
    { name: "loanAmount", label: "Loan amount", kind: "currency", defaultValue: "", required: true },
    { name: "interestRate", label: "Stated (nominal) interest rate (%)", kind: "percentage", defaultValue: "", required: true },
    { name: "fees", label: "Fees (points, origination, closing costs)", kind: "currency", defaultValue: "", required: true },
    { name: "termYears", label: "Loan term (years)", kind: "number", defaultValue: "30", min: 0.1, max: 40, step: 0.5, required: true },
  ],
  schema: aprSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "APR is the rate that makes the loan's fixed payment consistent with receiving only (Loan amount − Fees) instead of the full loan amount, solved numerically.",
  explanation: [
    {
      heading: "Why APR is higher than the interest rate",
      body: "You make payments based on the full loan amount, but you actually receive less once upfront fees are subtracted. APR expresses that gap as an equivalent higher interest rate.",
    },
  ],
  faq: [
    { q: "Why compare APR instead of just the interest rate?", a: "Two loans with the same interest rate but different fees have different true costs — APR lets you compare them on equal footing." },
  ],
  related: ["loan", "mortgage", "refinance"],
};
