import { Target } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";
import { Decimal, toRounded } from "../decimal-utils";

export const paybackPeriodSchema = z.object({
  initialInvestment: numberField({ label: "Initial investment", min: 0.01, max: 1_000_000_000 }),
  annualCashFlow: numberField({ label: "Annual cash flow", min: 0.01, max: 1_000_000_000 }),
  discountRate: numberField({ label: "Discount rate", min: 0, max: 100, required: false }),
});

export type PaybackPeriodValues = z.infer<typeof paybackPeriodSchema>;

function calculate(values: PaybackPeriodValues): CalcResult {
  const initial = new Decimal(values.initialInvestment);
  const cashFlow = new Decimal(values.annualCashFlow);
  const discountRate = new Decimal(values.discountRate ?? 0).dividedBy(100);

  const simplePayback = initial.dividedBy(cashFlow);

  const secondary = [
    { key: "initialInvestment", label: "Initial investment", value: toRounded(initial), format: "currency" as const },
    { key: "annualCashFlow", label: "Annual cash flow", value: toRounded(cashFlow), format: "currency" as const },
  ];

  const primaryValue = toRounded(simplePayback, 2);

  if (discountRate.greaterThan(0)) {
    let cumulative = new Decimal(0);
    let discountedPayback: Decimal | null = null;
    const maxYears = 100;
    for (let year = 1; year <= maxYears; year++) {
      const discountedCF = cashFlow.dividedBy(discountRate.plus(1).pow(year));
      const cumulativeBefore = cumulative;
      cumulative = cumulative.plus(discountedCF);
      if (cumulative.greaterThanOrEqualTo(initial)) {
        const remaining = initial.minus(cumulativeBefore);
        const fraction = discountedCF.isZero() ? new Decimal(0) : remaining.dividedBy(discountedCF);
        discountedPayback = new Decimal(year - 1).plus(fraction);
        break;
      }
    }

    if (discountedPayback === null) {
      return {
        primary: { key: "discountedPayback", label: "Discounted payback period", value: "Never (cash flows don't cover investment)", format: "text" },
        secondary: [...secondary, { key: "simplePayback", label: "Simple payback period (years)", value: toRounded(simplePayback, 2), format: "number" }],
        notes: ["At this discount rate, the discounted cash flows never fully repay the initial investment."],
      };
    }

    return {
      primary: { key: "discountedPayback", label: "Discounted payback period (years)", value: toRounded(discountedPayback, 2), format: "number" },
      secondary: [...secondary, { key: "simplePayback", label: "Simple payback period (years)", value: toRounded(simplePayback, 2), format: "number" }],
    };
  }

  return {
    primary: { key: "simplePayback", label: "Payback period (years)", value: primaryValue, format: "number" },
    secondary,
  };
}

export const paybackPeriodCalculator: CalculatorDef = {
  id: "payback-period",
  slug: "payback-period",
  title: "Payback Period Calculator",
  description: "Find how long it takes for an investment's cash flows to repay its initial cost.",
  category: "finance",
  icon: Target,
  keywords: ["payback period", "break even", "investment recovery", "discounted payback"],
  inputs: [
    { name: "initialInvestment", label: "Initial investment", kind: "currency", defaultValue: "", required: true },
    { name: "annualCashFlow", label: "Annual cash flow", kind: "currency", defaultValue: "", required: true },
  ],
  advancedInputs: [
    { name: "discountRate", label: "Discount rate (annual %, optional)", kind: "percentage", defaultValue: "0", required: false, helpText: "Enter a rate to compute the discounted payback period." },
  ],
  schema: paybackPeriodSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Simple payback period = Initial investment ÷ Annual cash flow. Discounted payback period sums discounted cash flows year by year until they cover the investment.",
  explanation: [
    {
      heading: "Assumes level annual cash flow",
      body: "This calculator assumes the same cash flow every year. For uneven cash flows, the true payback period may differ from this estimate.",
    },
  ],
  faq: [
    { q: "What's a good payback period?", a: "It depends on the industry and investment type, but shorter payback periods generally mean lower risk." },
  ],
  related: ["roi", "irr"],
};
