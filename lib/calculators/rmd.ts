import { CalendarCheck } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";
import { Decimal, toMoney } from "../decimal-utils";

// IRS Uniform Lifetime Table (effective 2022). Estimate only — confirm against
// the current IRS Publication 590-B, especially if a spouse is the sole
// beneficiary and more than 10 years younger.
const UNIFORM_LIFETIME_TABLE: Record<number, number> = {
  72: 27.4, 73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0, 79: 21.1,
  80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0, 86: 15.2, 87: 14.4,
  88: 13.7, 89: 12.9, 90: 12.2, 91: 11.5, 92: 10.8, 93: 10.1, 94: 9.5, 95: 8.9,
  96: 8.4, 97: 7.8, 98: 7.3, 99: 6.8, 100: 6.4,
};

export const rmdSchema = z.object({
  age: numberField({ label: "Age at year-end", min: 72, max: 100, integer: true }),
  accountBalance: numberField({ label: "Account balance (prior year-end)", min: 0, max: 1_000_000_000 }),
});

export type RmdValues = z.infer<typeof rmdSchema>;

function calculate(values: RmdValues): CalcResult {
  const balance = new Decimal(values.accountBalance);
  const factor = UNIFORM_LIFETIME_TABLE[values.age] ?? UNIFORM_LIFETIME_TABLE[100];
  const rmd = balance.dividedBy(factor);

  return {
    primary: { key: "rmd", label: "Required minimum distribution", value: toMoney(rmd), format: "currency" },
    secondary: [
      { key: "accountBalance", label: "Account balance", value: toMoney(balance), format: "currency" },
      { key: "factor", label: "Distribution factor", value: factor, format: "number" },
    ],
    notes: [
      "Estimate based on the IRS Uniform Lifetime Table. Confirm your exact factor with a tax advisor or IRS Publication 590-B, especially if your spouse is your sole beneficiary and more than 10 years younger.",
    ],
  };
}

export const rmdCalculator: CalculatorDef = {
  id: "rmd",
  slug: "rmd",
  title: "RMD Calculator",
  description: "Estimate your Required Minimum Distribution from a traditional retirement account.",
  category: "finance",
  icon: CalendarCheck,
  region: "US",
  keywords: ["rmd", "required minimum distribution", "ira withdrawal", "uniform lifetime table"],
  inputs: [
    { name: "age", label: "Age at year-end", kind: "number", defaultValue: "73", min: 72, max: 100, step: 1, required: true },
    { name: "accountBalance", label: "Account balance (prior year-end)", kind: "currency", defaultValue: "", required: true },
  ],
  schema: rmdSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "RMD = Prior year-end balance ÷ IRS distribution factor for your age (Uniform Lifetime Table).",
  explanation: [
    {
      heading: "Who this applies to",
      body: "RMDs apply to traditional IRAs, 401(k)s, and similar tax-deferred accounts once you reach the IRS-mandated starting age, which has changed under recent legislation. Roth IRAs don't require RMDs during the original owner's lifetime.",
    },
  ],
  faq: [
    { q: "What if I don't take my RMD?", a: "Missing an RMD can trigger a significant IRS excise tax on the amount not withdrawn. Confirm deadlines and amounts with a tax professional." },
  ],
  related: ["ira", "401k", "retirement"],
};
