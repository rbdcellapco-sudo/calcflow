import { Home } from "lucide-react";
import { z } from "zod";
import { addMonths, format as formatDate } from "date-fns";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";
import { Decimal, buildAmortizationSchedule, monthlyPayment, toMoney } from "../decimal-utils";

const TERM_OPTIONS = ["10", "15", "20", "30"] as const;

export const mortgageSchema = z
  .object({
    homePrice: numberField({ label: "Home price", min: 1, max: 1_000_000_000 }),
    downPayment: numberField({ label: "Down payment", min: 0, max: 1_000_000_000 }),
    interestRate: numberField({ label: "Interest rate", min: 0, max: 100 }),
    termYears: selectField(TERM_OPTIONS, "Loan term"),
    propertyTaxAnnual: numberField({ label: "Annual property tax", min: 0, required: false }),
    homeInsuranceAnnual: numberField({ label: "Annual home insurance", min: 0, required: false }),
    pmiMonthly: numberField({ label: "Monthly PMI", min: 0, required: false }),
    hoaMonthly: numberField({ label: "Monthly HOA", min: 0, required: false }),
  })
  .superRefine((data, ctx) => {
    if (data.downPayment >= data.homePrice) {
      ctx.addIssue({
        code: "custom",
        path: ["downPayment"],
        message: "Down payment must be less than the home price",
      });
    }
  });

export type MortgageValues = z.infer<typeof mortgageSchema>;

function calculate(values: MortgageValues): CalcResult {
  const homePrice = new Decimal(values.homePrice);
  const downPayment = new Decimal(values.downPayment);
  const principal = homePrice.minus(downPayment);
  const annualRate = new Decimal(values.interestRate).dividedBy(100);
  const monthlyRate = annualRate.dividedBy(12);
  const numPayments = Number(values.termYears) * 12;

  const monthlyPI = monthlyPayment(principal, monthlyRate, numPayments);
  const monthlyTax = new Decimal(values.propertyTaxAnnual ?? 0).dividedBy(12);
  const monthlyInsurance = new Decimal(values.homeInsuranceAnnual ?? 0).dividedBy(12);
  const monthlyPmi = new Decimal(values.pmiMonthly ?? 0);
  const monthlyHoa = new Decimal(values.hoaMonthly ?? 0);

  const totalMonthly = monthlyPI.plus(monthlyTax).plus(monthlyInsurance).plus(monthlyPmi).plus(monthlyHoa);

  const schedule = buildAmortizationSchedule(principal, monthlyRate, numPayments, monthlyPI);
  const totalInterest = schedule.reduce((sum, row) => sum.plus(row.interest), new Decimal(0));
  const totalLoanCost = principal.plus(totalInterest);

  const payoffDate = addMonths(new Date(), schedule.length);

  return {
    primary: {
      key: "totalMonthly",
      label: "Total monthly payment",
      value: toMoney(totalMonthly),
      format: "currency",
    },
    secondary: [
      { key: "loanAmount", label: "Loan amount", value: toMoney(principal), format: "currency" },
      { key: "monthlyPI", label: "Principal & interest", value: toMoney(monthlyPI), format: "currency" },
      { key: "totalInterest", label: "Total interest", value: toMoney(totalInterest), format: "currency" },
      { key: "totalLoanCost", label: "Total cost of loan", value: toMoney(totalLoanCost), format: "currency" },
      { key: "payoffDate", label: "Payoff date", value: formatDate(payoffDate, "MMMM yyyy"), format: "text" },
    ],
    table: schedule,
  };
}

export const mortgageCalculator: CalculatorDef = {
  id: "mortgage",
  slug: "mortgage",
  title: "Mortgage Calculator",
  description: "Estimate your monthly mortgage payment including taxes, insurance, PMI, and HOA.",
  category: "finance",
  icon: Home,
  region: "US",
  keywords: ["home loan", "house payment", "mortgage payment", "PITI", "down payment"],
  inputs: [
    { name: "homePrice", label: "Home price", kind: "currency", defaultValue: "", required: true },
    { name: "downPayment", label: "Down payment", kind: "currency", defaultValue: "", required: true },
    { name: "interestRate", label: "Interest rate (annual %)", kind: "percentage", defaultValue: "", required: true },
    {
      name: "termYears",
      label: "Loan term",
      kind: "select",
      defaultValue: "30",
      options: [
        { value: "10", label: "10 years" },
        { value: "15", label: "15 years" },
        { value: "20", label: "20 years" },
        { value: "30", label: "30 years" },
      ],
    },
  ],
  advancedInputs: [
    { name: "propertyTaxAnnual", label: "Annual property tax", kind: "currency", defaultValue: "0", required: false },
    { name: "homeInsuranceAnnual", label: "Annual home insurance", kind: "currency", defaultValue: "0", required: false },
    { name: "pmiMonthly", label: "Monthly PMI", kind: "currency", defaultValue: "0", required: false },
    { name: "hoaMonthly", label: "Monthly HOA", kind: "currency", defaultValue: "0", required: false },
  ],
  schema: mortgageSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Monthly P&I = P × r ÷ (1 − (1 + r)⁻ⁿ). Total monthly payment adds property tax, insurance, PMI, and HOA.",
  explanation: [
    {
      heading: "What's included",
      body: "This estimate covers principal, interest, taxes, insurance (PITI), plus optional PMI and HOA dues. Actual lender quotes may vary based on credit, loan program, and local fees.",
    },
  ],
  faq: [
    { q: "What is PMI?", a: "Private Mortgage Insurance is typically required when your down payment is less than 20% of the home price." },
  ],
  related: ["loan", "compound-interest"],
};
