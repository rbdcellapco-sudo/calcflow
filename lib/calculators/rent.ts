import { KeyRound } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";
import { Decimal, toMoney } from "../decimal-utils";

export const rentSchema = z.object({
  grossMonthlyIncome: numberField({ label: "Gross monthly income", min: 0.01, max: 10_000_000 }),
  monthlyDebtPayments: numberField({ label: "Other monthly debt payments", min: 0, max: 10_000_000, required: false }),
  maxRentToIncomePercent: numberField({ label: "Max rent-to-income ratio", min: 1, max: 100, required: false }),
});

export type RentValues = z.infer<typeof rentSchema>;

function calculate(values: RentValues): CalcResult {
  const income = new Decimal(values.grossMonthlyIncome);
  const debt = new Decimal(values.monthlyDebtPayments ?? 0);
  const ratio = new Decimal(values.maxRentToIncomePercent ?? 30).dividedBy(100);

  const maxRent = Decimal.max(income.times(ratio), 0);
  const maxRentAfterDebt = Decimal.max(income.times(ratio).minus(debt), 0);

  return {
    primary: { key: "maxRent", label: "Affordable monthly rent", value: toMoney(maxRent), format: "currency" },
    secondary: [
      { key: "maxRentAfterDebt", label: "Adjusted for other debt", value: toMoney(maxRentAfterDebt), format: "currency" },
      { key: "annualIncome", label: "Gross annual income", value: toMoney(income.times(12)), format: "currency" },
    ],
    notes: ["Based on the common guideline of spending no more than 30% of gross income on rent — adjust to fit your own budget and area."],
  };
}

export const rentCalculator: CalculatorDef = {
  id: "rent",
  slug: "rent",
  title: "Rent Calculator",
  description: "Estimate how much rent you can afford based on your income.",
  category: "finance",
  icon: KeyRound,
  keywords: ["rent affordability", "how much rent can i afford", "rent to income ratio"],
  inputs: [
    { name: "grossMonthlyIncome", label: "Gross monthly income", kind: "currency", defaultValue: "", required: true },
  ],
  advancedInputs: [
    { name: "monthlyDebtPayments", label: "Other monthly debt payments", kind: "currency", defaultValue: "0", required: false },
    { name: "maxRentToIncomePercent", label: "Max rent-to-income ratio (%)", kind: "percentage", defaultValue: "30", required: false },
  ],
  schema: rentSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Affordable rent = Gross monthly income × Rent-to-income ratio.",
  explanation: [
    {
      heading: "Why 30%?",
      body: "The 30% rule is a widely used rule of thumb, not a strict formula — your comfortable rent level also depends on other expenses, debt, and savings goals.",
    },
  ],
  faq: [
    { q: "Should I use gross or net income?", a: "Most rent affordability guidelines, and many landlords' screening criteria, use gross (pre-tax) income." },
  ],
  related: ["house-affordability", "rent-vs-buy", "budget"],
};
