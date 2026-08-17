import { Receipt } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";
import { Decimal, toMoney } from "../decimal-utils";

const MODES = ["add", "extract"] as const;

export const salesTaxSchema = z.object({
  mode: selectField(MODES, "Mode"),
  amount: numberField({ label: "Amount", min: 0, max: 1_000_000_000 }),
  taxRate: numberField({ label: "Sales tax rate", min: 0, max: 100 }),
});

export type SalesTaxValues = z.infer<typeof salesTaxSchema>;

function calculate(values: SalesTaxValues): CalcResult {
  const amount = new Decimal(values.amount);
  const rate = new Decimal(values.taxRate).dividedBy(100);

  if (values.mode === "add") {
    const tax = amount.times(rate);
    const total = amount.plus(tax);
    return {
      primary: { key: "total", label: "Total with tax", value: toMoney(total), format: "currency" },
      secondary: [
        { key: "preTaxAmount", label: "Pre-tax amount", value: toMoney(amount), format: "currency" },
        { key: "tax", label: "Sales tax", value: toMoney(tax), format: "currency" },
      ],
    };
  }

  const preTaxAmount = amount.dividedBy(rate.plus(1));
  const tax = amount.minus(preTaxAmount);
  return {
    primary: { key: "preTaxAmount", label: "Pre-tax amount", value: toMoney(preTaxAmount), format: "currency" },
    secondary: [
      { key: "total", label: "Total (with tax)", value: toMoney(amount), format: "currency" },
      { key: "tax", label: "Sales tax included", value: toMoney(tax), format: "currency" },
    ],
  };
}

export const salesTaxCalculator: CalculatorDef = {
  id: "sales-tax",
  slug: "sales-tax",
  title: "Sales Tax Calculator",
  description: "Add sales tax to a price, or back out the pre-tax amount from a total.",
  category: "finance",
  icon: Receipt,
  region: "US",
  keywords: ["sales tax", "tax calculator", "add tax", "reverse sales tax"],
  inputs: [
    {
      name: "mode",
      label: "Calculation type",
      kind: "segmented",
      defaultValue: "add",
      options: [
        { value: "add", label: "Add tax to a price" },
        { value: "extract", label: "Extract tax from a total" },
      ],
    },
    { name: "amount", label: "Amount", kind: "currency", defaultValue: "", required: true },
    { name: "taxRate", label: "Sales tax rate (%)", kind: "percentage", defaultValue: "", required: true },
  ],
  schema: salesTaxSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  dynamicLabels: (values) => ({
    amount: values.mode === "extract" ? "Total amount (tax included)" : "Pre-tax amount",
  }),
  formula: "Add tax: Total = Amount × (1 + rate). Extract tax: Pre-tax amount = Total ÷ (1 + rate).",
  explanation: [
    {
      heading: "US-style tax-exclusive pricing",
      body: "In the US, listed prices are typically pre-tax, with sales tax added at checkout — unlike VAT, which is usually included in the displayed price.",
    },
  ],
  faq: [
    { q: "How do I find the tax on a receipt total?", a: "Switch to 'Extract tax from a total' and enter the full amount you paid to see how much was tax." },
  ],
  related: ["vat", "discount", "tip"],
};
