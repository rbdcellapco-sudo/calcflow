import { GitCompareArrows } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";
import { Decimal, buildAmortizationSchedule, monthlyPayment, toMoney } from "../decimal-utils";

export const rentVsBuySchema = z.object({
  homePrice: numberField({ label: "Home price", min: 1, max: 1_000_000_000 }),
  downPayment: numberField({ label: "Down payment", min: 0, max: 1_000_000_000 }),
  interestRate: numberField({ label: "Mortgage interest rate", min: 0, max: 100 }),
  termYears: numberField({ label: "Mortgage term (years)", min: 1, max: 40 }),
  monthlyRent: numberField({ label: "Comparable monthly rent", min: 0, max: 1_000_000 }),
  yearsToCompare: numberField({ label: "Years to compare", min: 1, max: 40 }),
  propertyTaxRate: numberField({ label: "Annual property tax rate", min: 0, max: 10, required: false }),
  maintenanceRate: numberField({ label: "Annual maintenance rate", min: 0, max: 10, required: false }),
  homeAppreciationRate: numberField({ label: "Annual home appreciation rate", min: -20, max: 30, required: false }),
  rentIncreaseRate: numberField({ label: "Annual rent increase rate", min: 0, max: 30, required: false }),
  investmentReturnRate: numberField({ label: "Alternative investment return rate", min: 0, max: 30, required: false }),
});

export type RentVsBuyValues = z.infer<typeof rentVsBuySchema>;

function calculate(values: RentVsBuyValues): CalcResult {
  const homePrice = new Decimal(values.homePrice);
  const downPayment = new Decimal(values.downPayment);
  const loanAmount = homePrice.minus(downPayment);
  const monthlyRate = new Decimal(values.interestRate).dividedBy(100).dividedBy(12);
  const numPayments = Math.round(values.termYears * 12);
  const monthlyPI = monthlyPayment(loanAmount, monthlyRate, numPayments);

  const taxMaintRate = new Decimal(values.propertyTaxRate ?? 0).plus(values.maintenanceRate ?? 0).dividedBy(100);
  const appreciation = new Decimal(values.homeAppreciationRate ?? 3).dividedBy(100);
  const rentIncrease = new Decimal(values.rentIncreaseRate ?? 3).dividedBy(100);
  const investmentReturn = new Decimal(values.investmentReturnRate ?? 5).dividedBy(100);
  const monthlyRent = new Decimal(values.monthlyRent);

  const monthsToCompare = Math.min(values.yearsToCompare, values.termYears) * 12;
  const schedule = buildAmortizationSchedule(loanAmount, monthlyRate, numPayments, monthlyPI);
  const loanBalanceAtEnd = monthsToCompare >= schedule.length ? new Decimal(0) : new Decimal(schedule[monthsToCompare - 1].balance);

  let buyingCashOut = new Decimal(0);
  let rentingCashOut = new Decimal(0);

  for (let year = 1; year <= values.yearsToCompare; year++) {
    const homeValueThisYear = homePrice.times(appreciation.plus(1).pow(year));
    buyingCashOut = buyingCashOut.plus(homeValueThisYear.times(taxMaintRate));
    const rentThisYear = monthlyRent.times(12).times(rentIncrease.plus(1).pow(year - 1));
    rentingCashOut = rentingCashOut.plus(rentThisYear);
  }
  buyingCashOut = buyingCashOut.plus(monthlyPI.times(Math.min(values.yearsToCompare * 12, numPayments)));

  const homeValueAtEnd = homePrice.times(appreciation.plus(1).pow(values.yearsToCompare));
  const netEquityAtEnd = homeValueAtEnd.minus(loanBalanceAtEnd);
  const netCostBuying = downPayment.plus(buyingCashOut).minus(netEquityAtEnd);

  const investedDownPaymentFV = downPayment.times(investmentReturn.plus(1).pow(values.yearsToCompare));
  const netCostRenting = rentingCashOut.minus(investedDownPaymentFV).plus(downPayment);

  const difference = netCostRenting.minus(netCostBuying);
  const betterOption = difference.greaterThan(0) ? "Buying" : "Renting";

  return {
    primary: { key: "betterOption", label: `Cheaper over ${values.yearsToCompare} years`, value: betterOption, format: "text" },
    secondary: [
      { key: "netCostBuying", label: "Net cost of buying", value: toMoney(netCostBuying), format: "currency" },
      { key: "netCostRenting", label: "Net cost of renting", value: toMoney(netCostRenting), format: "currency" },
      { key: "netEquityAtEnd", label: "Home equity at end of period", value: toMoney(netEquityAtEnd), format: "currency" },
      { key: "difference", label: "Amount saved by the better option", value: toMoney(difference.abs()), format: "currency" },
    ],
    notes: [
      "Net cost = all cash paid out minus what you'd recover (home equity for buying, or investment growth on the unspent down payment for renting). This is a simplified model that doesn't account for taxes, closing costs, or moving costs.",
    ],
  };
}

export const rentVsBuyCalculator: CalculatorDef = {
  id: "rent-vs-buy",
  slug: "rent-vs-buy",
  title: "Rent vs. Buy Calculator",
  description: "Compare the net cost of renting vs. buying a home over a chosen number of years.",
  category: "finance",
  icon: GitCompareArrows,
  keywords: ["rent vs buy", "buy vs rent", "should i buy a home", "homeownership cost"],
  inputs: [
    { name: "homePrice", label: "Home price", kind: "currency", defaultValue: "", required: true },
    { name: "downPayment", label: "Down payment", kind: "currency", defaultValue: "", required: true },
    { name: "interestRate", label: "Mortgage interest rate (%)", kind: "percentage", defaultValue: "", required: true },
    { name: "termYears", label: "Mortgage term (years)", kind: "number", defaultValue: "30", min: 1, max: 40, step: 1, required: true },
    { name: "monthlyRent", label: "Comparable monthly rent", kind: "currency", defaultValue: "", required: true },
    { name: "yearsToCompare", label: "Years to compare", kind: "number", defaultValue: "7", min: 1, max: 40, step: 1, required: true },
  ],
  advancedInputs: [
    { name: "propertyTaxRate", label: "Annual property tax rate (%)", kind: "percentage", defaultValue: "1.1", required: false },
    { name: "maintenanceRate", label: "Annual maintenance rate (%)", kind: "percentage", defaultValue: "1", required: false },
    { name: "homeAppreciationRate", label: "Annual home appreciation rate (%)", kind: "percentage", defaultValue: "3", required: false },
    { name: "rentIncreaseRate", label: "Annual rent increase rate (%)", kind: "percentage", defaultValue: "3", required: false },
    { name: "investmentReturnRate", label: "Alternative investment return rate (%)", kind: "percentage", defaultValue: "5", required: false, helpText: "The return you'd expect if you invested your down payment instead of buying." },
  ],
  schema: rentVsBuySchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Net cost of buying = Down payment + mortgage payments + tax/maintenance − home equity at the end. Net cost of renting = Total rent paid − investment growth on the unspent down payment.",
  explanation: [
    {
      heading: "Why the comparison horizon matters",
      body: "Buying usually looks worse in the short term (closing costs, slower equity buildup) and better over longer horizons as the fixed mortgage payment stays flat while rent keeps rising and equity builds.",
    },
  ],
  faq: [
    { q: "Why does 'years to compare' matter so much?", a: "A short holding period rarely lets buying's equity and appreciation catch up to its upfront costs, while a long horizon typically favors buying." },
  ],
  related: ["mortgage", "rent", "rental-property"],
};
