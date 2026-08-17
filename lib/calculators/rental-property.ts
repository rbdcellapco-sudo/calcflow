import { Building } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";
import { Decimal, monthlyPayment, toMoney, toRounded } from "../decimal-utils";

export const rentalPropertySchema = z.object({
  purchasePrice: numberField({ label: "Purchase price", min: 1, max: 1_000_000_000 }),
  downPaymentPercent: numberField({ label: "Down payment", min: 0, max: 100 }),
  interestRate: numberField({ label: "Interest rate", min: 0, max: 100 }),
  termYears: numberField({ label: "Loan term (years)", min: 1, max: 40 }),
  monthlyRentIncome: numberField({ label: "Monthly rent income", min: 0, max: 10_000_000 }),
  monthlyExpenses: numberField({ label: "Monthly expenses (tax, insurance, maintenance, HOA)", min: 0, max: 10_000_000, required: false }),
  vacancyRate: numberField({ label: "Vacancy rate", min: 0, max: 100, required: false }),
  managementFeePercent: numberField({ label: "Property management fee", min: 0, max: 100, required: false }),
});

export type RentalPropertyValues = z.infer<typeof rentalPropertySchema>;

function calculate(values: RentalPropertyValues): CalcResult {
  const price = new Decimal(values.purchasePrice);
  const downPaymentAmount = price.times(new Decimal(values.downPaymentPercent).dividedBy(100));
  const loanAmount = price.minus(downPaymentAmount);
  const monthlyRate = new Decimal(values.interestRate).dividedBy(100).dividedBy(12);
  const numPayments = Math.round(values.termYears * 12);
  const monthlyPI = monthlyPayment(loanAmount, monthlyRate, numPayments);

  const vacancyRate = new Decimal(values.vacancyRate ?? 0).dividedBy(100);
  const grossRent = new Decimal(values.monthlyRentIncome);
  const effectiveRent = grossRent.times(new Decimal(1).minus(vacancyRate));

  const managementFeePercent = new Decimal(values.managementFeePercent ?? 0).dividedBy(100);
  const managementFee = effectiveRent.times(managementFeePercent);
  const expenses = new Decimal(values.monthlyExpenses ?? 0);

  const netOperatingIncomeMonthly = effectiveRent.minus(managementFee).minus(expenses);
  const monthlyCashFlow = netOperatingIncomeMonthly.minus(monthlyPI);
  const annualCashFlow = monthlyCashFlow.times(12);

  const capRate = price.isZero() ? new Decimal(0) : netOperatingIncomeMonthly.times(12).dividedBy(price).times(100);
  const cashOnCashReturn = downPaymentAmount.isZero() ? new Decimal(0) : annualCashFlow.dividedBy(downPaymentAmount).times(100);

  return {
    primary: { key: "monthlyCashFlow", label: "Monthly cash flow", value: toMoney(monthlyCashFlow), format: "currency" },
    secondary: [
      { key: "monthlyPI", label: "Principal & interest", value: toMoney(monthlyPI), format: "currency" },
      { key: "capRate", label: "Cap rate", value: toRounded(capRate), format: "percentage" },
      { key: "cashOnCashReturn", label: "Cash-on-cash return", value: toRounded(cashOnCashReturn), format: "percentage" },
      { key: "annualCashFlow", label: "Annual cash flow", value: toMoney(annualCashFlow), format: "currency" },
    ],
  };
}

export const rentalPropertyCalculator: CalculatorDef = {
  id: "rental-property",
  slug: "rental-property",
  title: "Rental Property Calculator",
  description: "Analyze cash flow, cap rate, and cash-on-cash return for an investment property.",
  category: "finance",
  icon: Building,
  keywords: ["rental property", "cap rate", "cash on cash return", "real estate investment"],
  inputs: [
    { name: "purchasePrice", label: "Purchase price", kind: "currency", defaultValue: "", required: true },
    { name: "downPaymentPercent", label: "Down payment (%)", kind: "percentage", defaultValue: "20", required: true },
    { name: "interestRate", label: "Interest rate (annual %)", kind: "percentage", defaultValue: "", required: true },
    { name: "termYears", label: "Loan term (years)", kind: "number", defaultValue: "30", min: 1, max: 40, step: 1, required: true },
    { name: "monthlyRentIncome", label: "Monthly rent income", kind: "currency", defaultValue: "", required: true },
  ],
  advancedInputs: [
    { name: "monthlyExpenses", label: "Monthly expenses (tax, insurance, maintenance, HOA)", kind: "currency", defaultValue: "0", required: false },
    { name: "vacancyRate", label: "Vacancy rate (%)", kind: "percentage", defaultValue: "5", required: false },
    { name: "managementFeePercent", label: "Property management fee (% of rent)", kind: "percentage", defaultValue: "0", required: false },
  ],
  schema: rentalPropertySchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Cap rate = Annual net operating income ÷ Purchase price. Cash-on-cash return = Annual cash flow ÷ Down payment. NOI excludes debt service; cash flow includes it.",
  explanation: [
    {
      heading: "Cap rate vs. cash-on-cash return",
      body: "Cap rate measures the property's return ignoring financing, useful for comparing properties. Cash-on-cash return measures your actual return on the cash you invested, accounting for the mortgage.",
    },
  ],
  faq: [
    { q: "What's a good cap rate?", a: "It varies widely by market, but many investors look for cap rates roughly in the 4-10% range depending on location and risk tolerance." },
  ],
  related: ["mortgage", "rent-vs-buy", "roi"],
};
