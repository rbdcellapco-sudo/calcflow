import { GitCompare } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";
import { Decimal, monthlyPayment, toMoney } from "../decimal-utils";

export const cashBackOrLowInterestSchema = z.object({
  vehiclePrice: numberField({ label: "Vehicle price", min: 1, max: 10_000_000 }),
  downPayment: numberField({ label: "Down payment", min: 0, max: 10_000_000, required: false }),
  cashBackAmount: numberField({ label: "Cash back offer", min: 0, max: 1_000_000 }),
  standardApr: numberField({ label: "Standard APR (with cash back)", min: 0, max: 100 }),
  lowApr: numberField({ label: "Low APR (no cash back)", min: 0, max: 100 }),
  termMonths: numberField({ label: "Loan term (months)", min: 1, max: 120 }),
});

export type CashBackOrLowInterestValues = z.infer<typeof cashBackOrLowInterestSchema>;

function calculate(values: CashBackOrLowInterestValues): CalcResult {
  const price = new Decimal(values.vehiclePrice);
  const downPayment = new Decimal(values.downPayment ?? 0);
  const cashBack = new Decimal(values.cashBackAmount);

  const cashBackPrincipal = Decimal.max(price.minus(downPayment).minus(cashBack), 0);
  const cashBackRate = new Decimal(values.standardApr).dividedBy(100).dividedBy(12);
  const cashBackPayment = monthlyPayment(cashBackPrincipal, cashBackRate, values.termMonths);
  const cashBackTotalCost = cashBackPayment.times(values.termMonths).plus(downPayment);

  const lowAprPrincipal = Decimal.max(price.minus(downPayment), 0);
  const lowAprRate = new Decimal(values.lowApr).dividedBy(100).dividedBy(12);
  const lowAprPayment = monthlyPayment(lowAprPrincipal, lowAprRate, values.termMonths);
  const lowAprTotalCost = lowAprPayment.times(values.termMonths).plus(downPayment);

  const betterOption = cashBackTotalCost.lessThan(lowAprTotalCost) ? "Cash back" : "Low interest rate";
  const savings = cashBackTotalCost.minus(lowAprTotalCost).abs();

  return {
    primary: { key: "betterOption", label: "Better deal", value: betterOption, format: "text" },
    secondary: [
      { key: "cashBackPayment", label: "Monthly payment (cash back offer)", value: toMoney(cashBackPayment), format: "currency" },
      { key: "cashBackTotalCost", label: "Total cost (cash back offer)", value: toMoney(cashBackTotalCost), format: "currency" },
      { key: "lowAprPayment", label: "Monthly payment (low APR offer)", value: toMoney(lowAprPayment), format: "currency" },
      { key: "lowAprTotalCost", label: "Total cost (low APR offer)", value: toMoney(lowAprTotalCost), format: "currency" },
      { key: "savings", label: "Amount saved by the better option", value: toMoney(savings), format: "currency" },
    ],
  };
}

export const cashBackOrLowInterestCalculator: CalculatorDef = {
  id: "cash-back-or-low-interest",
  slug: "cash-back-or-low-interest",
  title: "Cash Back or Low Interest Calculator",
  description: "Compare a cash-back rebate against a low-interest financing offer to see which costs less.",
  category: "finance",
  icon: GitCompare,
  keywords: ["cash back", "low interest financing", "auto financing offer", "dealer incentive"],
  inputs: [
    { name: "vehiclePrice", label: "Vehicle price", kind: "currency", defaultValue: "", required: true },
    { name: "cashBackAmount", label: "Cash back offer", kind: "currency", defaultValue: "", required: true },
    { name: "standardApr", label: "Standard APR (with cash back)", kind: "percentage", defaultValue: "", required: true },
    { name: "lowApr", label: "Low APR (no cash back)", kind: "percentage", defaultValue: "", required: true },
    { name: "termMonths", label: "Loan term (months)", kind: "number", defaultValue: "60", min: 1, max: 120, step: 1, required: true },
  ],
  advancedInputs: [
    { name: "downPayment", label: "Down payment", kind: "currency", defaultValue: "0", required: false },
  ],
  schema: cashBackOrLowInterestSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Compares total cost (all payments + down payment) financing the cash-back-reduced price at the standard APR vs. financing the full price at the low APR.",
  explanation: [
    {
      heading: "It depends on the rate spread and term",
      body: "Cash back tends to win when the APR difference between offers is small or the loan term is short. Low-interest financing tends to win with a large rate spread or a longer term, since more interest is avoided.",
    },
  ],
  faq: [
    { q: "Can I use this for non-auto purchases?", a: "The math works for any financed purchase with a comparable cash-rebate-vs-low-rate choice, not just vehicles." },
  ],
  related: ["auto-loan", "auto-lease", "loan"],
};
