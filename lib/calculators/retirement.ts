import { Palmtree } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";
import { Decimal, toMoney } from "../decimal-utils";

export const retirementSchema = z
  .object({
    currentAge: numberField({ label: "Current age", min: 1, max: 100, integer: true }),
    retirementAge: numberField({ label: "Retirement age", min: 1, max: 100, integer: true }),
    currentSavings: numberField({ label: "Current retirement savings", min: 0, max: 1_000_000_000 }),
    monthlyContribution: numberField({ label: "Monthly contribution", min: 0, max: 10_000_000 }),
    annualReturn: numberField({ label: "Expected annual return", min: 0, max: 100 }),
  })
  .superRefine((data, ctx) => {
    if (data.retirementAge <= data.currentAge) {
      ctx.addIssue({ code: "custom", path: ["retirementAge"], message: "Retirement age must be after current age" });
    }
  });

export type RetirementValues = z.infer<typeof retirementSchema>;

function calculate(values: RetirementValues): CalcResult {
  const currentSavings = new Decimal(values.currentSavings);
  const monthlyContribution = new Decimal(values.monthlyContribution);
  const monthlyRate = new Decimal(values.annualReturn).dividedBy(100).dividedBy(12);
  const months = Math.round((values.retirementAge - values.currentAge) * 12);

  const growth = monthlyRate.plus(1).pow(months);
  const fvSavings = currentSavings.times(growth);
  const fvContributions = monthlyRate.isZero()
    ? monthlyContribution.times(months)
    : monthlyContribution.times(growth.minus(1).dividedBy(monthlyRate));

  const nestEgg = fvSavings.plus(fvContributions);
  const totalContributed = monthlyContribution.times(months);
  const totalDeposited = currentSavings.plus(totalContributed);
  const totalGrowth = nestEgg.minus(totalDeposited);

  return {
    primary: { key: "nestEgg", label: `Savings at age ${values.retirementAge}`, value: toMoney(nestEgg), format: "currency" },
    secondary: [
      { key: "totalDeposited", label: "Total deposited", value: toMoney(totalDeposited), format: "currency" },
      { key: "totalGrowth", label: "Total investment growth", value: toMoney(totalGrowth), format: "currency" },
      { key: "yearsToGrow", label: "Years until retirement", value: values.retirementAge - values.currentAge, format: "years" },
    ],
  };
}

export const retirementCalculator: CalculatorDef = {
  id: "retirement",
  slug: "retirement",
  title: "Retirement Calculator",
  description: "Project your retirement savings based on current savings, contributions, and expected returns.",
  category: "finance",
  icon: Palmtree,
  keywords: ["retirement savings", "nest egg", "401k projection", "retire"],
  inputs: [
    { name: "currentAge", label: "Current age", kind: "number", defaultValue: "30", min: 1, max: 100, step: 1, required: true },
    { name: "retirementAge", label: "Retirement age", kind: "number", defaultValue: "65", min: 1, max: 100, step: 1, required: true },
    { name: "currentSavings", label: "Current retirement savings", kind: "currency", defaultValue: "0", required: true },
    { name: "monthlyContribution", label: "Monthly contribution", kind: "currency", defaultValue: "", required: true },
    { name: "annualReturn", label: "Expected annual return (%)", kind: "percentage", defaultValue: "7", required: true },
  ],
  schema: retirementSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Nest egg = Current savings × (1 + i)ⁿ + Monthly contribution × [((1 + i)ⁿ − 1) ÷ i], where i is the monthly return and n is months until retirement.",
  explanation: [
    {
      heading: "This is a projection, not a guarantee",
      body: "Actual investment returns vary year to year. This calculator assumes a constant average annual return, which smooths out that real-world volatility.",
    },
  ],
  faq: [
    { q: "What return rate should I assume?", a: "Many long-term planners use 6-8% for a diversified stock-heavy portfolio, but your own allocation and risk tolerance should guide this input." },
  ],
  related: ["compound-interest", "annuity", "401k"],
};
