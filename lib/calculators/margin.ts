import { Percent } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";
import { Decimal, toMoney, toRounded } from "../decimal-utils";

const MODES = ["find-price", "find-margin"] as const;

export const marginSchema = z.object({
  mode: selectField(MODES, "Mode"),
  cost: numberField({ label: "Cost", min: 0, max: 1_000_000_000 }),
  value: numberField({ label: "Value", min: 0, max: 100_000 }),
});

export type MarginValues = z.infer<typeof marginSchema>;

function calculate(values: MarginValues): CalcResult {
  const cost = new Decimal(values.cost);

  if (values.mode === "find-price") {
    const marginPercent = new Decimal(values.value).dividedBy(100);
    const price = marginPercent.equals(1) ? new Decimal(0) : cost.dividedBy(new Decimal(1).minus(marginPercent));
    const profit = price.minus(cost);
    const markup = cost.isZero() ? new Decimal(0) : profit.dividedBy(cost).times(100);

    return {
      primary: { key: "price", label: "Selling price", value: toMoney(price), format: "currency" },
      secondary: [
        { key: "profit", label: "Profit", value: toMoney(profit), format: "currency" },
        { key: "markup", label: "Markup", value: toRounded(markup), format: "percentage" },
      ],
    };
  }

  const price = new Decimal(values.value);
  const profit = price.minus(cost);
  const margin = price.isZero() ? new Decimal(0) : profit.dividedBy(price).times(100);
  const markup = cost.isZero() ? new Decimal(0) : profit.dividedBy(cost).times(100);

  return {
    primary: { key: "margin", label: "Profit margin", value: toRounded(margin), format: "percentage" },
    secondary: [
      { key: "profit", label: "Profit", value: toMoney(profit), format: "currency" },
      { key: "markup", label: "Markup", value: toRounded(markup), format: "percentage" },
    ],
  };
}

export const marginCalculator: CalculatorDef = {
  id: "margin",
  slug: "margin",
  title: "Margin Calculator",
  description: "Find your selling price from a target margin, or your margin and markup from cost and price.",
  category: "finance",
  icon: Percent,
  keywords: ["profit margin", "markup", "gross margin", "selling price"],
  inputs: [
    {
      name: "mode",
      label: "Calculation type",
      kind: "segmented",
      defaultValue: "find-margin",
      options: [
        { value: "find-margin", label: "Find margin from price" },
        { value: "find-price", label: "Find price from margin" },
      ],
    },
    { name: "cost", label: "Cost", kind: "currency", defaultValue: "", required: true },
    { name: "value", label: "Selling price", kind: "number", defaultValue: "", required: true },
  ],
  schema: marginSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  dynamicLabels: (values) => ({
    value: values.mode === "find-price" ? "Target margin (%)" : "Selling price",
  }),
  formula: "Margin = Profit ÷ Price. Markup = Profit ÷ Cost. Price from margin = Cost ÷ (1 − margin).",
  explanation: [
    {
      heading: "Margin vs. markup — not the same thing",
      body: "Margin is profit as a percentage of the selling price. Markup is profit as a percentage of the cost. A 50% markup is only a 33% margin, which trips up a lot of pricing decisions.",
    },
  ],
  faq: [
    { q: "Which should I use for pricing decisions?", a: "Margin is usually more useful since it directly tells you what share of revenue is profit, which matters for cash flow and profitability targets." },
  ],
  related: ["discount", "commission", "roi"],
};
