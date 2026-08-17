import { Home } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";
import { Decimal, monthlyPayment, toMoney } from "../decimal-utils";

export const houseAffordabilitySchema = z.object({
  grossAnnualIncome: numberField({ label: "Gross annual income", min: 1, max: 1_000_000_000 }),
  monthlyDebtPayments: numberField({ label: "Other monthly debt payments", min: 0, max: 1_000_000, required: false }),
  downPayment: numberField({ label: "Down payment", min: 0, max: 1_000_000_000 }),
  interestRate: numberField({ label: "Interest rate", min: 0, max: 100 }),
  termYears: numberField({ label: "Loan term (years)", min: 1, max: 40 }),
  maxDtiPercent: numberField({ label: "Max debt-to-income ratio", min: 1, max: 100, required: false }),
  propertyTaxRate: numberField({ label: "Annual property tax rate", min: 0, max: 10, required: false }),
  homeInsuranceRate: numberField({ label: "Annual home insurance rate", min: 0, max: 10, required: false }),
});

export type HouseAffordabilityValues = z.infer<typeof houseAffordabilitySchema>;

function calculate(values: HouseAffordabilityValues): CalcResult {
  const grossMonthlyIncome = new Decimal(values.grossAnnualIncome).dividedBy(12);
  const otherDebt = new Decimal(values.monthlyDebtPayments ?? 0);
  const maxDti = new Decimal(values.maxDtiPercent ?? 36).dividedBy(100);
  const downPayment = new Decimal(values.downPayment);
  const monthlyRate = new Decimal(values.interestRate).dividedBy(100).dividedBy(12);
  const numPayments = Math.round(values.termYears * 12);
  const taxInsuranceRate = new Decimal(values.propertyTaxRate ?? 0).plus(values.homeInsuranceRate ?? 0).dividedBy(100).dividedBy(12);

  const maxHousingPayment = Decimal.max(grossMonthlyIncome.times(maxDti).minus(otherDebt), 0);

  // monthlyPI = (homePrice - downPayment) * k, taxInsurance = homePrice * m
  // (homePrice - downPayment) * k + homePrice * m = maxHousingPayment
  const k = monthlyPayment(new Decimal(1), monthlyRate, numPayments);
  const denominator = k.plus(taxInsuranceRate);
  const homePrice = denominator.isZero() ? new Decimal(0) : maxHousingPayment.plus(downPayment.times(k)).dividedBy(denominator);
  const loanAmount = Decimal.max(homePrice.minus(downPayment), 0);
  const monthlyPI = loanAmount.times(k);
  const monthlyTaxInsurance = homePrice.times(taxInsuranceRate);

  return {
    primary: { key: "affordableHomePrice", label: "Affordable home price", value: toMoney(homePrice), format: "currency" },
    secondary: [
      { key: "loanAmount", label: "Estimated loan amount", value: toMoney(loanAmount), format: "currency" },
      { key: "monthlyPI", label: "Principal & interest", value: toMoney(monthlyPI), format: "currency" },
      { key: "monthlyTaxInsurance", label: "Estimated tax & insurance", value: toMoney(monthlyTaxInsurance), format: "currency" },
      { key: "maxHousingPayment", label: "Max total housing payment", value: toMoney(maxHousingPayment), format: "currency" },
    ],
    notes: ["Based on a target debt-to-income ratio, not a specific lender's underwriting rules — actual pre-approval amounts can differ."],
  };
}

export const houseAffordabilityCalculator: CalculatorDef = {
  id: "house-affordability",
  slug: "house-affordability",
  title: "House Affordability Calculator",
  description: "Estimate how much home you can afford based on income, debt, and a target DTI ratio.",
  category: "finance",
  icon: Home,
  keywords: ["how much house can i afford", "home affordability", "mortgage qualification"],
  inputs: [
    { name: "grossAnnualIncome", label: "Gross annual income", kind: "currency", defaultValue: "", required: true },
    { name: "downPayment", label: "Down payment", kind: "currency", defaultValue: "", required: true },
    { name: "interestRate", label: "Interest rate (annual %)", kind: "percentage", defaultValue: "", required: true },
    { name: "termYears", label: "Loan term (years)", kind: "number", defaultValue: "30", min: 1, max: 40, step: 1, required: true },
  ],
  advancedInputs: [
    { name: "monthlyDebtPayments", label: "Other monthly debt payments", kind: "currency", defaultValue: "0", required: false },
    { name: "maxDtiPercent", label: "Max debt-to-income ratio (%)", kind: "percentage", defaultValue: "36", required: false },
    { name: "propertyTaxRate", label: "Annual property tax rate (%)", kind: "percentage", defaultValue: "1.1", required: false },
    { name: "homeInsuranceRate", label: "Annual home insurance rate (%)", kind: "percentage", defaultValue: "0.4", required: false },
  ],
  schema: houseAffordabilitySchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Solves for the home price where (Loan × payment factor) + (Home price × tax/insurance rate) equals your target monthly housing budget from the DTI limit.",
  explanation: [
    {
      heading: "This is an estimate, not a pre-approval",
      body: "Lenders also weigh credit score, employment history, cash reserves, and other factors beyond a simple DTI ratio.",
    },
  ],
  faq: [
    { q: "What DTI ratio should I use?", a: "36% is a commonly cited conservative benchmark; some loan programs allow up to 43-50% for well-qualified borrowers." },
  ],
  related: ["mortgage", "down-payment", "debt-to-income-ratio"],
};
