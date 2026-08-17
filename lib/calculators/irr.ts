import { Activity } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";
import { Decimal, toRounded } from "../decimal-utils";

export const irrSchema = z.object({
  initialInvestment: numberField({ label: "Initial investment", min: 0.01, max: 1_000_000_000 }),
  year1: numberField({ label: "Year 1 cash flow", required: false }),
  year2: numberField({ label: "Year 2 cash flow", required: false }),
  year3: numberField({ label: "Year 3 cash flow", required: false }),
  year4: numberField({ label: "Year 4 cash flow", required: false }),
  year5: numberField({ label: "Year 5 cash flow", required: false }),
});

export type IrrValues = z.infer<typeof irrSchema>;

/** Net present value of a cash flow series at rate `r` (year 0 = -initialInvestment). */
function npv(rate: number, cashFlows: number[]): number {
  return cashFlows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + rate, t), 0);
}

/** Solve for IRR via bisection over a plausible rate range. */
function solveIrr(cashFlows: number[]): number | null {
  let lo = -0.99;
  let hi = 10; // 1000%
  const npvLo = npv(lo, cashFlows);
  const npvHi = npv(hi, cashFlows);
  if (npvLo === 0) return lo;
  if (npvHi === 0) return hi;
  if ((npvLo > 0 && npvHi > 0) || (npvLo < 0 && npvHi < 0)) return null; // no sign change in range

  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const npvMid = npv(mid, cashFlows);
    if (Math.abs(npvMid) < 1e-7) return mid;
    if ((npvMid > 0) === (npvLo > 0)) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return (lo + hi) / 2;
}

function calculate(values: IrrValues): CalcResult {
  const cashFlows = [
    -values.initialInvestment,
    values.year1 ?? 0,
    values.year2 ?? 0,
    values.year3 ?? 0,
    values.year4 ?? 0,
    values.year5 ?? 0,
  ];

  const irr = solveIrr(cashFlows);
  const totalReturn = cashFlows.slice(1).reduce((a, b) => a + b, 0);
  const netProfit = totalReturn - values.initialInvestment;

  if (irr === null) {
    return {
      primary: { key: "irr", label: "IRR", value: "No solution found", format: "text" },
      secondary: [
        { key: "netProfit", label: "Net profit", value: toRounded(new Decimal(netProfit)), format: "currency" },
      ],
      notes: ["No internal rate of return could be found for these cash flows in a -99% to 1000% range."],
    };
  }

  return {
    primary: { key: "irr", label: "Internal rate of return", value: toRounded(new Decimal(irr * 100)), format: "percentage" },
    secondary: [
      { key: "netProfit", label: "Net profit (undiscounted)", value: toRounded(new Decimal(netProfit)), format: "currency" },
      { key: "totalReturn", label: "Total cash returned", value: toRounded(new Decimal(totalReturn)), format: "currency" },
    ],
  };
}

export const irrCalculator: CalculatorDef = {
  id: "irr",
  slug: "irr",
  title: "IRR Calculator",
  description: "Find the internal rate of return for an investment with up to 5 years of cash flows.",
  category: "finance",
  icon: Activity,
  keywords: ["irr", "internal rate of return", "cash flow", "discounted cash flow"],
  inputs: [
    { name: "initialInvestment", label: "Initial investment", kind: "currency", defaultValue: "", required: true },
    { name: "year1", label: "Year 1 cash flow", kind: "currency", defaultValue: "0", required: false },
    { name: "year2", label: "Year 2 cash flow", kind: "currency", defaultValue: "0", required: false },
    { name: "year3", label: "Year 3 cash flow", kind: "currency", defaultValue: "0", required: false },
  ],
  advancedInputs: [
    { name: "year4", label: "Year 4 cash flow", kind: "currency", defaultValue: "0", required: false },
    { name: "year5", label: "Year 5 cash flow", kind: "currency", defaultValue: "0", required: false },
  ],
  schema: irrSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "IRR is the rate r where NPV = −Initial investment + Σ CFₜ ÷ (1 + r)ᵗ = 0, solved numerically.",
  explanation: [
    {
      heading: "What IRR tells you",
      body: "IRR is the annualized rate of return at which an investment's cash flows break even in present-value terms. A higher IRR generally means a more attractive investment, all else equal.",
    },
  ],
  faq: [
    { q: "Why is my IRR unsolvable?", a: "If all cash flows are positive or all are negative, there's no rate that makes NPV zero, so no IRR exists." },
  ],
  related: ["roi", "payback-period", "present-value"],
};
