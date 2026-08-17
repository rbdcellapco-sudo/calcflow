import { ListChecks } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";
import { Decimal, toMoney } from "../decimal-utils";

export const debtPayoffSchema = z.object({
  balance1: numberField({ label: "Debt 1 balance", min: 0.01, max: 10_000_000 }),
  apr1: numberField({ label: "Debt 1 APR", min: 0, max: 100 }),
  minPayment1: numberField({ label: "Debt 1 minimum payment", min: 0, max: 1_000_000 }),
  balance2: numberField({ label: "Debt 2 balance", min: 0, max: 10_000_000, required: false }),
  apr2: numberField({ label: "Debt 2 APR", min: 0, max: 100, required: false }),
  minPayment2: numberField({ label: "Debt 2 minimum payment", min: 0, max: 1_000_000, required: false }),
  balance3: numberField({ label: "Debt 3 balance", min: 0, max: 10_000_000, required: false }),
  apr3: numberField({ label: "Debt 3 APR", min: 0, max: 100, required: false }),
  minPayment3: numberField({ label: "Debt 3 minimum payment", min: 0, max: 1_000_000, required: false }),
  extraPayment: numberField({ label: "Extra monthly payment", min: 0, max: 1_000_000, required: false }),
});

export type DebtPayoffValues = z.infer<typeof debtPayoffSchema>;

type Debt = { balance: Decimal; apr: Decimal; minPayment: Decimal };

function calculate(values: DebtPayoffValues): CalcResult {
  const debts: Debt[] = [
    { balance: new Decimal(values.balance1), apr: new Decimal(values.apr1), minPayment: new Decimal(values.minPayment1) },
  ];
  if ((values.balance2 ?? 0) > 0) {
    debts.push({ balance: new Decimal(values.balance2 ?? 0), apr: new Decimal(values.apr2 ?? 0), minPayment: new Decimal(values.minPayment2 ?? 0) });
  }
  if ((values.balance3 ?? 0) > 0) {
    debts.push({ balance: new Decimal(values.balance3 ?? 0), apr: new Decimal(values.apr3 ?? 0), minPayment: new Decimal(values.minPayment3 ?? 0) });
  }

  const startingTotal = debts.reduce((sum, d) => sum.plus(d.balance), new Decimal(0));
  let extraPool = new Decimal(values.extraPayment ?? 0);
  let totalInterest = new Decimal(0);
  let months = 0;
  const maxMonths = 1200;

  while (debts.some((d) => d.balance.greaterThan(0)) && months < maxMonths) {
    months += 1;

    for (const d of debts) {
      if (d.balance.lessThanOrEqualTo(0)) continue;
      const interest = d.balance.times(d.apr.dividedBy(100).dividedBy(12));
      totalInterest = totalInterest.plus(interest);
      d.balance = d.balance.plus(interest);
    }

    // Avalanche: highest APR among still-active debts gets the extra payment.
    const active = debts.filter((d) => d.balance.greaterThan(0)).sort((a, b) => b.apr.comparedTo(a.apr));
    let freedThisMonth = new Decimal(0);
    let extraThisMonth = extraPool;

    for (let i = 0; i < active.length; i++) {
      const d = active[i];
      let payment = d.minPayment;
      if (i === 0) payment = payment.plus(extraThisMonth);
      payment = Decimal.min(payment, d.balance);
      d.balance = d.balance.minus(payment);
      if (d.balance.lessThanOrEqualTo(0.005)) {
        d.balance = new Decimal(0);
        freedThisMonth = freedThisMonth.plus(d.minPayment);
      }
    }
    extraPool = extraPool.plus(freedThisMonth);
  }

  const years = Math.floor(months / 12);
  const remMonths = months % 12;

  return {
    primary: { key: "payoffTime", label: "Time to pay off all debts", value: `${years > 0 ? `${years}y ` : ""}${remMonths}mo`, format: "text" },
    secondary: [
      { key: "months", label: "Total months", value: months, format: "number" },
      { key: "startingTotal", label: "Starting total debt", value: toMoney(startingTotal), format: "currency" },
      { key: "totalInterest", label: "Total interest paid", value: toMoney(totalInterest), format: "currency" },
    ],
    notes: ["Uses the avalanche method: extra payments (and freed-up minimums from paid-off debts) go to the highest-APR debt first."],
  };
}

export const debtPayoffCalculator: CalculatorDef = {
  id: "debt-payoff",
  slug: "debt-payoff",
  title: "Debt Payoff Calculator",
  description: "Plan payoff of multiple debts at once using the avalanche (highest-APR-first) method.",
  category: "finance",
  icon: ListChecks,
  keywords: ["debt payoff", "avalanche method", "multiple debts", "debt free"],
  inputs: [
    { name: "balance1", label: "Debt 1 balance", kind: "currency", defaultValue: "", required: true },
    { name: "apr1", label: "Debt 1 APR (%)", kind: "percentage", defaultValue: "", required: true },
    { name: "minPayment1", label: "Debt 1 minimum payment", kind: "currency", defaultValue: "", required: true },
  ],
  advancedInputs: [
    { name: "balance2", label: "Debt 2 balance (optional)", kind: "currency", defaultValue: "0", required: false },
    { name: "apr2", label: "Debt 2 APR (%)", kind: "percentage", defaultValue: "0", required: false },
    { name: "minPayment2", label: "Debt 2 minimum payment", kind: "currency", defaultValue: "0", required: false },
    { name: "balance3", label: "Debt 3 balance (optional)", kind: "currency", defaultValue: "0", required: false },
    { name: "apr3", label: "Debt 3 APR (%)", kind: "percentage", defaultValue: "0", required: false },
    { name: "minPayment3", label: "Debt 3 minimum payment", kind: "currency", defaultValue: "0", required: false },
    { name: "extraPayment", label: "Extra monthly payment (across all debts)", kind: "currency", defaultValue: "0", required: false },
  ],
  schema: debtPayoffSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Each month, minimum payments are made on every debt; any extra payment (plus minimums freed up by paid-off debts) is applied to the debt with the highest APR.",
  explanation: [
    {
      heading: "Avalanche vs. snowball",
      body: "The avalanche method (used here) targets the highest interest rate first, minimizing total interest paid. The snowball method targets the smallest balance first for psychological momentum, but usually costs more in interest.",
    },
  ],
  faq: [
    { q: "What if I only have one debt?", a: "Leave debts 2 and 3 at zero — the calculator will just simulate the one debt, similar to the Credit Card Payoff Calculator." },
  ],
  related: ["credit-card-payoff", "debt-consolidation", "debt-to-income-ratio"],
};
