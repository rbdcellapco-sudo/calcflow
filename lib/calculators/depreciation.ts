import { TrendingDown } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";
import { Decimal, toMoney } from "../decimal-utils";

const METHODS = ["straight-line", "declining-balance"] as const;

export const depreciationSchema = z
  .object({
    method: selectField(METHODS, "Method"),
    assetCost: numberField({ label: "Asset cost", min: 0.01, max: 1_000_000_000 }),
    salvageValue: numberField({ label: "Salvage value", min: 0, max: 1_000_000_000 }),
    usefulLifeYears: numberField({ label: "Useful life (years)", min: 1, max: 100, integer: true }),
  })
  .superRefine((data, ctx) => {
    if (data.salvageValue > data.assetCost) {
      ctx.addIssue({ code: "custom", path: ["salvageValue"], message: "Salvage value can't exceed the asset cost" });
    }
  });

export type DepreciationValues = z.infer<typeof depreciationSchema>;

function calculate(values: DepreciationValues): CalcResult {
  const cost = new Decimal(values.assetCost);
  const salvage = new Decimal(values.salvageValue);
  const life = values.usefulLifeYears;

  if (values.method === "straight-line") {
    const annualDepreciation = cost.minus(salvage).dividedBy(life);
    const table = Array.from({ length: life }, (_, i) => {
      const year = i + 1;
      const accumulated = annualDepreciation.times(year);
      const bookValue = cost.minus(accumulated);
      return { year, depreciation: toMoney(annualDepreciation), accumulated: toMoney(accumulated), bookValue: toMoney(bookValue) };
    });

    return {
      primary: { key: "annualDepreciation", label: "Annual depreciation", value: toMoney(annualDepreciation), format: "currency" },
      secondary: [
        { key: "totalDepreciation", label: "Total depreciation", value: toMoney(cost.minus(salvage)), format: "currency" },
      ],
      table,
    };
  }

  // Double-declining balance
  const rate = new Decimal(2).dividedBy(life);
  let bookValue = cost;
  const table: Record<string, string | number>[] = [];
  for (let year = 1; year <= life; year++) {
    let depreciation = bookValue.times(rate);
    if (bookValue.minus(depreciation).lessThan(salvage)) {
      depreciation = bookValue.minus(salvage);
    }
    bookValue = bookValue.minus(depreciation);
    table.push({ year, depreciation: toMoney(depreciation), bookValue: toMoney(bookValue) });
  }

  const firstYearDepreciation = table[0]?.depreciation ?? 0;

  return {
    primary: { key: "firstYearDepreciation", label: "First-year depreciation", value: firstYearDepreciation, format: "currency" },
    secondary: [
      { key: "totalDepreciation", label: "Total depreciation over useful life", value: toMoney(cost.minus(bookValue)), format: "currency" },
      { key: "endingBookValue", label: "Ending book value", value: toMoney(bookValue), format: "currency" },
    ],
    table,
  };
}

export const depreciationCalculator: CalculatorDef = {
  id: "depreciation",
  slug: "depreciation",
  title: "Depreciation Calculator",
  description: "Calculate straight-line or double-declining-balance depreciation with a full schedule.",
  category: "finance",
  icon: TrendingDown,
  keywords: ["depreciation", "straight line", "declining balance", "asset value"],
  inputs: [
    {
      name: "method",
      label: "Depreciation method",
      kind: "segmented",
      defaultValue: "straight-line",
      options: [
        { value: "straight-line", label: "Straight-line" },
        { value: "declining-balance", label: "Declining balance" },
      ],
    },
    { name: "assetCost", label: "Asset cost", kind: "currency", defaultValue: "", required: true },
    { name: "salvageValue", label: "Salvage value", kind: "currency", defaultValue: "0", required: true },
    { name: "usefulLifeYears", label: "Useful life (years)", kind: "number", defaultValue: "5", min: 1, max: 100, step: 1, required: true },
  ],
  schema: depreciationSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Straight-line: (Cost − Salvage) ÷ Life. Double-declining balance: Book value × (2 ÷ Life) each year, floored at salvage value.",
  explanation: [
    {
      heading: "Straight-line vs. declining balance",
      body: "Straight-line spreads depreciation evenly across the asset's life. Declining balance front-loads larger deductions in earlier years, which better matches how many assets actually lose value.",
    },
  ],
  faq: [
    { q: "Which method should I use for taxes?", a: "Tax depreciation rules vary by jurisdiction and asset type — check with a tax professional or your local tax authority for what's allowed." },
  ],
  related: ["business-loan", "amortization"],
};
