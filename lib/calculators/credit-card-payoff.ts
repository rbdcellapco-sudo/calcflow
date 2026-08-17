import { CreditCard } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";
import { Decimal, toMoney } from "../decimal-utils";

export const creditCardPayoffSchema = z
  .object({
    balance: numberField({ label: "Current balance", min: 0.01, max: 10_000_000 }),
    apr: numberField({ label: "APR", min: 0, max: 100 }),
    monthlyPayment: numberField({ label: "Monthly payment", min: 0.01, max: 10_000_000 }),
  })
  .superRefine((data, ctx) => {
    const monthlyInterest = (data.balance * data.apr) / 100 / 12;
    if (data.monthlyPayment <= monthlyInterest) {
      ctx.addIssue({
        code: "custom",
        path: ["monthlyPayment"],
        message: "Payment must be more than the monthly interest charge or the balance will never shrink",
      });
    }
  });

export type CreditCardPayoffValues = z.infer<typeof creditCardPayoffSchema>;

function calculate(values: CreditCardPayoffValues): CalcResult {
  const monthlyRate = new Decimal(values.apr).dividedBy(100).dividedBy(12);
  const payment = new Decimal(values.monthlyPayment);
  let balance = new Decimal(values.balance);
  let totalInterest = new Decimal(0);
  let months = 0;
  const maxMonths = 1200;

  while (balance.greaterThan(0) && months < maxMonths) {
    const interest = balance.times(monthlyRate);
    totalInterest = totalInterest.plus(interest);
    balance = balance.plus(interest);
    const thisPayment = Decimal.min(payment, balance);
    balance = balance.minus(thisPayment);
    months += 1;
  }

  const years = Math.floor(months / 12);
  const remMonths = months % 12;

  return {
    primary: { key: "payoffTime", label: "Time to pay off", value: `${years > 0 ? `${years}y ` : ""}${remMonths}mo`, format: "text" },
    secondary: [
      { key: "months", label: "Total months", value: months, format: "number" },
      { key: "totalInterest", label: "Total interest paid", value: toMoney(totalInterest), format: "currency" },
      { key: "totalPaid", label: "Total paid", value: toMoney(new Decimal(values.balance).plus(totalInterest)), format: "currency" },
    ],
  };
}

export const creditCardPayoffCalculator: CalculatorDef = {
  id: "credit-card-payoff",
  slug: "credit-card-payoff",
  title: "Credit Card Payoff Calculator",
  description: "Find how long it takes to pay off a credit card balance at a fixed monthly payment.",
  category: "finance",
  icon: CreditCard,
  keywords: ["credit card", "payoff", "credit card debt", "apr"],
  inputs: [
    { name: "balance", label: "Current balance", kind: "currency", defaultValue: "", required: true },
    { name: "apr", label: "APR (%)", kind: "percentage", defaultValue: "", required: true },
    { name: "monthlyPayment", label: "Monthly payment", kind: "currency", defaultValue: "", required: true },
  ],
  schema: creditCardPayoffSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Each month: interest = balance × (APR ÷ 12); balance += interest − payment. Repeated until the balance reaches zero.",
  explanation: [
    {
      heading: "Why minimum payments take so long",
      body: "Credit card interest compounds monthly. A payment only slightly above the interest charge shrinks the principal very slowly, dramatically extending payoff time and total interest paid.",
    },
  ],
  faq: [
    { q: "Why does it say my payment is too low?", a: "If your payment doesn't exceed the interest charged each month, the balance grows instead of shrinking, so payoff time would be infinite." },
  ],
  related: ["debt-payoff", "debt-consolidation", "debt-to-income-ratio"],
};
