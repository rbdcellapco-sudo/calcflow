import { RefreshCw } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef, ResultValue } from "../types";
import { numberField } from "../validation";
import { Decimal, monthlyPayment, toMoney, toRounded } from "../decimal-utils";

export const refinanceSchema = z.object({
  currentBalance: numberField({ label: "Current loan balance", min: 1, max: 1_000_000_000 }),
  currentRate: numberField({ label: "Current interest rate", min: 0, max: 100 }),
  currentRemainingYears: numberField({ label: "Current remaining term", min: 0.1, max: 40 }),
  newRate: numberField({ label: "New interest rate", min: 0, max: 100 }),
  newTermYears: numberField({ label: "New loan term", min: 0.1, max: 40 }),
  closingCosts: numberField({ label: "Closing costs", min: 0, max: 1_000_000, required: false }),
});

export type RefinanceValues = z.infer<typeof refinanceSchema>;

function calculate(values: RefinanceValues): CalcResult {
  const balance = new Decimal(values.currentBalance);
  const currentMonthlyRate = new Decimal(values.currentRate).dividedBy(100).dividedBy(12);
  const currentPayments = Math.round(values.currentRemainingYears * 12);
  const newMonthlyRate = new Decimal(values.newRate).dividedBy(100).dividedBy(12);
  const newPayments = Math.round(values.newTermYears * 12);
  const closingCosts = new Decimal(values.closingCosts ?? 0);

  const currentPayment = monthlyPayment(balance, currentMonthlyRate, currentPayments);
  const newPayment = monthlyPayment(balance, newMonthlyRate, newPayments);
  const monthlySavings = currentPayment.minus(newPayment);

  const currentTotalInterest = currentPayment.times(currentPayments).minus(balance);
  const newTotalInterest = newPayment.times(newPayments).minus(balance);

  const secondary: ResultValue[] = [
    { key: "currentPayment", label: "Current monthly payment", value: toMoney(currentPayment), format: "currency" },
    { key: "newPayment", label: "New monthly payment", value: toMoney(newPayment), format: "currency" },
    { key: "currentTotalInterest", label: "Remaining interest (current loan)", value: toMoney(currentTotalInterest), format: "currency" },
    { key: "newTotalInterest", label: "Total interest (new loan)", value: toMoney(newTotalInterest), format: "currency" },
  ];

  if (closingCosts.greaterThan(0) && monthlySavings.greaterThan(0)) {
    const breakEvenMonths = closingCosts.dividedBy(monthlySavings);
    secondary.push({ key: "breakEvenMonths", label: "Break-even period (months)", value: toRounded(breakEvenMonths, 1), format: "number" as const });
  }

  return {
    primary: { key: "monthlySavings", label: "Monthly savings", value: toMoney(monthlySavings), format: "currency" },
    secondary,
    notes: monthlySavings.lessThanOrEqualTo(0) ? ["Your new payment isn't lower than your current one — refinancing may still help if you're shortening the term or switching loan types."] : undefined,
  };
}

export const refinanceCalculator: CalculatorDef = {
  id: "refinance",
  slug: "refinance",
  title: "Refinance Calculator",
  description: "Compare your current loan payment to a refinanced rate and find your break-even point.",
  category: "finance",
  icon: RefreshCw,
  keywords: ["refinance", "refi", "break-even", "lower rate"],
  inputs: [
    { name: "currentBalance", label: "Current loan balance", kind: "currency", defaultValue: "", required: true },
    { name: "currentRate", label: "Current interest rate (%)", kind: "percentage", defaultValue: "", required: true },
    { name: "currentRemainingYears", label: "Current remaining term (years)", kind: "number", defaultValue: "25", min: 0.1, max: 40, step: 0.5, required: true },
    { name: "newRate", label: "New interest rate (%)", kind: "percentage", defaultValue: "", required: true },
    { name: "newTermYears", label: "New loan term (years)", kind: "number", defaultValue: "30", min: 0.1, max: 40, step: 0.5, required: true },
  ],
  advancedInputs: [
    { name: "closingCosts", label: "Closing costs", kind: "currency", defaultValue: "0", required: false },
  ],
  schema: refinanceSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Break-even (months) = Closing costs ÷ Monthly savings, where monthly savings is the current payment minus the new payment.",
  explanation: [
    {
      heading: "Watch the break-even point",
      body: "If you plan to move or refinance again before the break-even point, the closing costs may outweigh the savings.",
    },
  ],
  faq: [
    { q: "Does this account for resetting the loan term?", a: "Yes — extending the term (e.g. refinancing 25 years remaining into a new 30-year loan) can lower your payment even at the same rate, but usually increases total interest paid." },
  ],
  related: ["mortgage", "loan", "mortgage-payoff"],
};
