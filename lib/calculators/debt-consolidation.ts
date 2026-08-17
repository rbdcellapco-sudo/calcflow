import { Layers } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";
import { Decimal, monthlyPayment, toMoney } from "../decimal-utils";

export const debtConsolidationSchema = z.object({
  balance1: numberField({ label: "Debt 1 balance", min: 0.01, max: 10_000_000 }),
  apr1: numberField({ label: "Debt 1 APR", min: 0, max: 100 }),
  balance2: numberField({ label: "Debt 2 balance", min: 0, max: 10_000_000, required: false }),
  apr2: numberField({ label: "Debt 2 APR", min: 0, max: 100, required: false }),
  balance3: numberField({ label: "Debt 3 balance", min: 0, max: 10_000_000, required: false }),
  apr3: numberField({ label: "Debt 3 APR", min: 0, max: 100, required: false }),
  consolidationRate: numberField({ label: "Consolidation loan rate", min: 0, max: 100 }),
  consolidationTermYears: numberField({ label: "Consolidation loan term", min: 0.1, max: 30 }),
});

export type DebtConsolidationValues = z.infer<typeof debtConsolidationSchema>;

function calculate(values: DebtConsolidationValues): CalcResult {
  const balances = [values.balance1, values.balance2 ?? 0, values.balance3 ?? 0];
  const aprs = [values.apr1, values.apr2 ?? 0, values.apr3 ?? 0];

  const totalDebt = balances.reduce((sum, b) => sum.plus(new Decimal(b)), new Decimal(0));
  const weightedAprSum = balances.reduce((sum, b, i) => sum.plus(new Decimal(b).times(aprs[i])), new Decimal(0));
  const currentBlendedApr = totalDebt.greaterThan(0) ? weightedAprSum.dividedBy(totalDebt) : new Decimal(0);
  const currentMonthlyInterest = totalDebt.times(currentBlendedApr).dividedBy(100).dividedBy(12);

  const monthlyRate = new Decimal(values.consolidationRate).dividedBy(100).dividedBy(12);
  const numPayments = Math.round(values.consolidationTermYears * 12);
  const newPayment = monthlyPayment(totalDebt, monthlyRate, numPayments);
  const newTotalPaid = newPayment.times(numPayments);
  const newTotalInterest = newTotalPaid.minus(totalDebt);

  return {
    primary: { key: "newPayment", label: "New consolidated monthly payment", value: toMoney(newPayment), format: "currency" },
    secondary: [
      { key: "totalDebt", label: "Total debt consolidated", value: toMoney(totalDebt), format: "currency" },
      { key: "currentBlendedApr", label: "Current blended APR", value: toMoney(currentBlendedApr), format: "percentage" },
      { key: "currentMonthlyInterest", label: "Current monthly interest cost", value: toMoney(currentMonthlyInterest), format: "currency" },
      { key: "newTotalInterest", label: "Total interest on new loan", value: toMoney(newTotalInterest), format: "currency" },
    ],
    notes: ["Compares your current blended interest rate to the new consolidation loan rate — a lower blended rate and/or shorter term generally means paying less in total interest."],
  };
}

export const debtConsolidationCalculator: CalculatorDef = {
  id: "debt-consolidation",
  slug: "debt-consolidation",
  title: "Debt Consolidation Calculator",
  description: "Compare your current blended interest rate to a single consolidation loan.",
  category: "finance",
  icon: Layers,
  keywords: ["debt consolidation", "consolidation loan", "blended rate", "combine debt"],
  inputs: [
    { name: "balance1", label: "Debt 1 balance", kind: "currency", defaultValue: "", required: true },
    { name: "apr1", label: "Debt 1 APR (%)", kind: "percentage", defaultValue: "", required: true },
    { name: "consolidationRate", label: "Consolidation loan rate (%)", kind: "percentage", defaultValue: "", required: true },
    { name: "consolidationTermYears", label: "Consolidation loan term (years)", kind: "number", defaultValue: "3", min: 0.1, max: 30, step: 0.5, required: true },
  ],
  advancedInputs: [
    { name: "balance2", label: "Debt 2 balance (optional)", kind: "currency", defaultValue: "0", required: false },
    { name: "apr2", label: "Debt 2 APR (%)", kind: "percentage", defaultValue: "0", required: false },
    { name: "balance3", label: "Debt 3 balance (optional)", kind: "currency", defaultValue: "0", required: false },
    { name: "apr3", label: "Debt 3 APR (%)", kind: "percentage", defaultValue: "0", required: false },
  ],
  schema: debtConsolidationSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Blended APR = Σ(balance × APR) ÷ Total balance. New payment uses the standard amortizing loan formula on the combined total.",
  explanation: [
    {
      heading: "Consolidation isn't automatically cheaper",
      body: "A consolidation loan only saves money if its rate is meaningfully lower than your current blended rate, or if a longer term's lower payment is worth more interest paid overall.",
    },
  ],
  faq: [
    { q: "What if I only have one debt?", a: "Leave debts 2 and 3 at zero — this still works as a straightforward refinance comparison for a single balance." },
  ],
  related: ["debt-payoff", "credit-card-payoff", "loan"],
};
