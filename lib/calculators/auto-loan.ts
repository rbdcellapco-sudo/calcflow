import { Car } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";
import { Decimal, monthlyPayment, toMoney } from "../decimal-utils";

export const autoLoanSchema = z.object({
  vehiclePrice: numberField({ label: "Vehicle price", min: 0, max: 10_000_000 }),
  downPayment: numberField({ label: "Down payment", min: 0, max: 10_000_000, required: false }),
  tradeInValue: numberField({ label: "Trade-in value", min: 0, max: 10_000_000, required: false }),
  salesTaxRate: numberField({ label: "Sales tax rate", min: 0, max: 30, required: false }),
  interestRate: numberField({ label: "Interest rate", min: 0, max: 100 }),
  termMonths: numberField({ label: "Loan term (months)", min: 1, max: 120 }),
});

export type AutoLoanValues = z.infer<typeof autoLoanSchema>;

function calculate(values: AutoLoanValues): CalcResult {
  const price = new Decimal(values.vehiclePrice);
  const downPayment = new Decimal(values.downPayment ?? 0);
  const tradeIn = new Decimal(values.tradeInValue ?? 0);
  const taxRate = new Decimal(values.salesTaxRate ?? 0).dividedBy(100);

  const taxableAmount = Decimal.max(price.minus(tradeIn), 0);
  const salesTax = taxableAmount.times(taxRate);
  const principal = Decimal.max(price.minus(downPayment).minus(tradeIn).plus(salesTax), 0);

  const monthlyRate = new Decimal(values.interestRate).dividedBy(100).dividedBy(12);
  const payment = monthlyPayment(principal, monthlyRate, values.termMonths);
  const totalPaid = payment.times(values.termMonths);
  const totalInterest = totalPaid.minus(principal);

  return {
    primary: { key: "monthlyPayment", label: "Monthly payment", value: toMoney(payment), format: "currency" },
    secondary: [
      { key: "amountFinanced", label: "Amount financed", value: toMoney(principal), format: "currency" },
      { key: "salesTax", label: "Sales tax", value: toMoney(salesTax), format: "currency" },
      { key: "totalInterest", label: "Total interest", value: toMoney(totalInterest), format: "currency" },
      { key: "totalPaid", label: "Total paid", value: toMoney(totalPaid), format: "currency" },
    ],
  };
}

export const autoLoanCalculator: CalculatorDef = {
  id: "auto-loan",
  slug: "auto-loan",
  title: "Auto Loan Calculator",
  description: "Calculate your monthly car payment including trade-in, down payment, and sales tax.",
  category: "finance",
  icon: Car,
  keywords: ["car loan", "auto loan", "vehicle financing", "car payment"],
  inputs: [
    { name: "vehiclePrice", label: "Vehicle price", kind: "currency", defaultValue: "", required: true },
    { name: "interestRate", label: "Interest rate (annual %)", kind: "percentage", defaultValue: "", required: true },
    { name: "termMonths", label: "Loan term (months)", kind: "number", defaultValue: "60", min: 1, max: 120, step: 1, required: true },
  ],
  advancedInputs: [
    { name: "downPayment", label: "Down payment", kind: "currency", defaultValue: "0", required: false },
    { name: "tradeInValue", label: "Trade-in value", kind: "currency", defaultValue: "0", required: false },
    { name: "salesTaxRate", label: "Sales tax rate (%)", kind: "percentage", defaultValue: "0", required: false },
  ],
  schema: autoLoanSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Amount financed = Price − Down payment − Trade-in + Sales tax. Monthly payment uses the standard amortizing loan formula.",
  explanation: [
    {
      heading: "Sales tax on trade-ins",
      body: "Many jurisdictions only tax the difference between the vehicle price and your trade-in value, which this calculator assumes. Check your local rules if this differs.",
    },
  ],
  faq: [
    { q: "How is this different from the general Loan Calculator?", a: "This adds vehicle-specific inputs — trade-in value and sales tax — that affect the amount you actually finance." },
  ],
  related: ["loan", "auto-lease", "cash-back-or-low-interest"],
};
