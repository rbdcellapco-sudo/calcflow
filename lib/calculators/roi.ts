import { PieChart } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef, ResultValue } from "../types";
import { numberField } from "../validation";
import { Decimal, toRounded } from "../decimal-utils";

export const roiSchema = z.object({
  initialInvestment: numberField({ label: "Initial investment", min: 0.01, max: 1_000_000_000 }),
  finalValue: numberField({ label: "Final value", min: 0, max: 1_000_000_000 }),
  years: numberField({ label: "Holding period (years)", min: 0, max: 100, required: false }),
});

export type RoiValues = z.infer<typeof roiSchema>;

function calculate(values: RoiValues): CalcResult {
  const initial = new Decimal(values.initialInvestment);
  const final = new Decimal(values.finalValue);
  const gain = final.minus(initial);
  const roi = gain.dividedBy(initial).times(100);

  const secondary: ResultValue[] = [
    { key: "gain", label: "Net gain / loss", value: toRounded(gain), format: "currency" },
    { key: "initialInvestment", label: "Initial investment", value: toRounded(initial), format: "currency" },
    { key: "finalValue", label: "Final value", value: toRounded(final), format: "currency" },
  ];

  const years = values.years ?? 0;
  if (years > 0) {
    const ratio = final.dividedBy(initial);
    const annualizedRoi = ratio.isNegative()
      ? null
      : new Decimal(Math.pow(ratio.toNumber(), 1 / years) - 1).times(100);
    if (annualizedRoi !== null) {
      secondary.push({ key: "annualizedRoi", label: "Annualized ROI", value: toRounded(annualizedRoi), format: "percentage" as const });
    }
  }

  return {
    primary: { key: "roi", label: "Return on investment", value: toRounded(roi), format: "percentage" },
    secondary,
  };
}

export const roiCalculator: CalculatorDef = {
  id: "roi",
  slug: "roi",
  title: "ROI Calculator",
  description: "Calculate the return on investment, and annualized ROI over a holding period.",
  category: "finance",
  icon: PieChart,
  keywords: ["roi", "return on investment", "annualized return", "investment gain"],
  inputs: [
    { name: "initialInvestment", label: "Initial investment", kind: "currency", defaultValue: "", required: true },
    { name: "finalValue", label: "Final value", kind: "currency", defaultValue: "", required: true },
  ],
  advancedInputs: [
    { name: "years", label: "Holding period (years, optional)", kind: "number", defaultValue: "", min: 0, max: 100, step: 0.5, required: false, helpText: "Enter to also see annualized ROI." },
  ],
  schema: roiSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "ROI = (Final value − Initial investment) ÷ Initial investment × 100. Annualized ROI = ((Final ÷ Initial)^(1/years) − 1) × 100.",
  explanation: [
    {
      heading: "ROI vs. annualized ROI",
      body: "Plain ROI measures total return over the whole holding period, regardless of how long it took. Annualized ROI spreads that return evenly across each year, making it easier to compare investments held for different lengths of time.",
    },
  ],
  faq: [
    { q: "What counts as a good ROI?", a: "It varies by asset class and risk level, but many investors compare ROI against a benchmark like a stock market index." },
  ],
  related: ["payback-period", "irr", "compound-interest"],
};
