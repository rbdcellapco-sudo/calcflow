import { Coins } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";
import { Decimal, toMoney } from "../decimal-utils";

export const simpleInterestSchema = z.object({
  principal: numberField({ label: "Principal", min: 0, max: 1_000_000_000 }),
  annualRate: numberField({ label: "Annual interest rate", min: 0, max: 100 }),
  years: numberField({ label: "Time period (years)", min: 0, max: 100 }),
});

export type SimpleInterestValues = z.infer<typeof simpleInterestSchema>;

function calculate(values: SimpleInterestValues): CalcResult {
  const principal = new Decimal(values.principal);
  const rate = new Decimal(values.annualRate).dividedBy(100);
  const years = new Decimal(values.years);

  const interest = principal.times(rate).times(years);
  const total = principal.plus(interest);

  return {
    primary: { key: "total", label: "Total amount", value: toMoney(total), format: "currency" },
    secondary: [
      { key: "principal", label: "Principal", value: toMoney(principal), format: "currency" },
      { key: "interest", label: "Interest earned", value: toMoney(interest), format: "currency" },
    ],
  };
}

export const simpleInterestCalculator: CalculatorDef = {
  id: "simple-interest",
  slug: "simple-interest",
  title: "Simple Interest Calculator",
  description: "Calculate interest earned or owed using simple (non-compounding) interest.",
  category: "finance",
  icon: Coins,
  keywords: ["simple interest", "interest earned", "linear interest"],
  inputs: [
    { name: "principal", label: "Principal", kind: "currency", defaultValue: "", required: true },
    { name: "annualRate", label: "Annual interest rate (%)", kind: "percentage", defaultValue: "", required: true },
    { name: "years", label: "Time period (years)", kind: "number", defaultValue: "1", min: 0, max: 100, step: 0.5, required: true },
  ],
  schema: simpleInterestSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "I = P × r × t, where P is principal, r is the annual rate, and t is time in years. Total = P + I.",
  explanation: [
    {
      heading: "Simple vs. compound interest",
      body: "Simple interest is earned only on the original principal, growing linearly over time. It doesn't earn interest on previously accumulated interest the way compound interest does.",
    },
  ],
  faq: [
    { q: "When is simple interest used?", a: "Simple interest is common for short-term loans, car loans, and some bonds. Most savings accounts and investments use compound interest instead." },
  ],
  related: ["compound-interest", "cd"],
};
