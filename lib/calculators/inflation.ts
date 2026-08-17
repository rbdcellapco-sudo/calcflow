import { TrendingUp } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";
import { Decimal, toMoney, toRounded } from "../decimal-utils";

export const inflationSchema = z.object({
  amount: numberField({ label: "Amount", min: 0, max: 1_000_000_000 }),
  years: numberField({ label: "Number of years", min: 0, max: 100 }),
  inflationRate: numberField({ label: "Annual inflation rate", min: 0, max: 100 }),
});

export type InflationValues = z.infer<typeof inflationSchema>;

function calculate(values: InflationValues): CalcResult {
  const amount = new Decimal(values.amount);
  const rate = new Decimal(values.inflationRate).dividedBy(100);
  const futureCost = amount.times(rate.plus(1).pow(values.years));
  const cumulativeInflation = rate.plus(1).pow(values.years).minus(1).times(100);
  const purchasingPowerRemaining = futureCost.isZero() ? new Decimal(0) : amount.dividedBy(futureCost).times(100);

  return {
    primary: { key: "futureCost", label: `Equivalent cost in ${values.years} years`, value: toMoney(futureCost), format: "currency" },
    secondary: [
      { key: "cumulativeInflation", label: "Cumulative inflation", value: toRounded(cumulativeInflation), format: "percentage" },
      { key: "purchasingPowerRemaining", label: "Today's amount as % of future cost", value: toRounded(purchasingPowerRemaining), format: "percentage" },
    ],
  };
}

export const inflationCalculator: CalculatorDef = {
  id: "inflation",
  slug: "inflation",
  title: "Inflation Calculator",
  description: "See how much a price or amount will grow over time due to inflation.",
  category: "finance",
  icon: TrendingUp,
  keywords: ["inflation", "purchasing power", "cost of living", "future cost"],
  inputs: [
    { name: "amount", label: "Amount", kind: "currency", defaultValue: "", required: true },
    { name: "years", label: "Number of years", kind: "number", defaultValue: "10", min: 0, max: 100, step: 1, required: true },
    { name: "inflationRate", label: "Annual inflation rate (%)", kind: "percentage", defaultValue: "5", required: true },
  ],
  schema: inflationSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Future cost = Amount × (1 + inflation rate)ʸᵉᵃʳˢ.",
  explanation: [
    {
      heading: "Why this matters for planning",
      body: "Money that just sits still loses purchasing power to inflation over time. This is a key reason long-term savings and investment goals are usually set well above today's costs.",
    },
  ],
  faq: [
    { q: "What inflation rate should I use?", a: "Many long-term planning tools use 3-6% depending on the country and time period — check recent historical CPI data for your region for a more precise figure." },
  ],
  related: ["retirement", "college-cost", "compound-interest"],
};
