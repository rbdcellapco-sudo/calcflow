import { School } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";
import { Decimal, toMoney } from "../decimal-utils";

export const collegeCostSchema = z.object({
  currentAnnualCost: numberField({ label: "Current annual cost", min: 0, max: 1_000_000 }),
  yearsUntilEnrollment: numberField({ label: "Years until enrollment", min: 0, max: 30 }),
  yearsInCollege: numberField({ label: "Years in college", min: 1, max: 10 }),
  inflationRate: numberField({ label: "College cost inflation rate", min: 0, max: 30 }),
  currentSavings: numberField({ label: "Current college savings", min: 0, max: 10_000_000, required: false }),
  annualReturn: numberField({ label: "Expected annual return on savings", min: 0, max: 100, required: false }),
});

export type CollegeCostValues = z.infer<typeof collegeCostSchema>;

function calculate(values: CollegeCostValues): CalcResult {
  const currentCost = new Decimal(values.currentAnnualCost);
  const inflation = new Decimal(values.inflationRate).dividedBy(100);
  const firstYearCost = currentCost.times(inflation.plus(1).pow(values.yearsUntilEnrollment));

  const n = values.yearsInCollege;
  const totalCost = inflation.isZero()
    ? firstYearCost.times(n)
    : firstYearCost.times(inflation.plus(1).pow(n).minus(1)).dividedBy(inflation);

  const secondary = [
    { key: "firstYearCost", label: "First-year cost at enrollment", value: toMoney(firstYearCost), format: "currency" as const },
  ];

  const currentSavings = new Decimal(values.currentSavings ?? 0);
  if (currentSavings.greaterThan(0)) {
    const returnRate = new Decimal(values.annualReturn ?? 0).dividedBy(100);
    const savingsFV = currentSavings.times(returnRate.plus(1).pow(values.yearsUntilEnrollment));
    const shortfall = totalCost.minus(savingsFV);
    secondary.push({ key: "savingsFV", label: "Savings projected at enrollment", value: toMoney(savingsFV), format: "currency" as const });
    secondary.push({ key: "shortfall", label: shortfall.greaterThan(0) ? "Projected shortfall" : "Projected surplus", value: toMoney(shortfall.abs()), format: "currency" as const });
  }

  return {
    primary: { key: "totalCost", label: `Total cost for ${n} years`, value: toMoney(totalCost), format: "currency" },
    secondary,
  };
}

export const collegeCostCalculator: CalculatorDef = {
  id: "college-cost",
  slug: "college-cost",
  title: "College Cost Calculator",
  description: "Project total future college costs and see if your current savings plan is on track.",
  category: "finance",
  icon: School,
  keywords: ["college cost", "tuition", "education savings", "529 plan"],
  inputs: [
    { name: "currentAnnualCost", label: "Current annual cost (tuition + fees + room/board)", kind: "currency", defaultValue: "", required: true },
    { name: "yearsUntilEnrollment", label: "Years until enrollment", kind: "number", defaultValue: "10", min: 0, max: 30, step: 1, required: true },
    { name: "yearsInCollege", label: "Years in college", kind: "number", defaultValue: "4", min: 1, max: 10, step: 1, required: true },
    { name: "inflationRate", label: "College cost inflation rate (%)", kind: "percentage", defaultValue: "5", min: 0, max: 30, step: 0.5, required: true },
  ],
  advancedInputs: [
    { name: "currentSavings", label: "Current college savings", kind: "currency", defaultValue: "0", required: false },
    { name: "annualReturn", label: "Expected annual return on savings (%)", kind: "percentage", defaultValue: "6", required: false },
  ],
  schema: collegeCostSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "First-year cost = Current cost × (1 + inflation)ʸᵉᵃʳˢ. Total cost sums each subsequent year's inflated cost across the years enrolled.",
  explanation: [
    {
      heading: "College costs typically outpace general inflation",
      body: "Historically, college costs have often risen faster than general consumer inflation, which is why this calculator uses a separate, adjustable inflation rate for education costs.",
    },
  ],
  faq: [
    { q: "What inflation rate should I use?", a: "A commonly cited range is 4-6% annually for college cost growth, though it varies by institution type and time period." },
  ],
  related: ["student-loan", "compound-interest", "retirement"],
};
