import { FileText } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";
import { Decimal, toMoney } from "../decimal-utils";

const MODES = ["extract", "add"] as const;

export const vatSchema = z.object({
  mode: selectField(MODES, "Mode"),
  amount: numberField({ label: "Amount", min: 0, max: 1_000_000_000 }),
  vatRate: numberField({ label: "VAT rate", min: 0, max: 100 }),
});

export type VatValues = z.infer<typeof vatSchema>;

function calculate(values: VatValues): CalcResult {
  const amount = new Decimal(values.amount);
  const rate = new Decimal(values.vatRate).dividedBy(100);

  if (values.mode === "extract") {
    const netAmount = amount.dividedBy(rate.plus(1));
    const vat = amount.minus(netAmount);
    return {
      primary: { key: "netAmount", label: "Net amount (excl. VAT)", value: toMoney(netAmount), format: "currency" },
      secondary: [
        { key: "grossAmount", label: "Gross amount (incl. VAT)", value: toMoney(amount), format: "currency" },
        { key: "vat", label: "VAT included", value: toMoney(vat), format: "currency" },
      ],
    };
  }

  const vat = amount.times(rate);
  const grossAmount = amount.plus(vat);
  return {
    primary: { key: "grossAmount", label: "Gross amount (incl. VAT)", value: toMoney(grossAmount), format: "currency" },
    secondary: [
      { key: "netAmount", label: "Net amount (excl. VAT)", value: toMoney(amount), format: "currency" },
      { key: "vat", label: "VAT", value: toMoney(vat), format: "currency" },
    ],
  };
}

export const vatCalculator: CalculatorDef = {
  id: "vat",
  slug: "vat",
  title: "VAT Calculator",
  description: "Extract VAT from a VAT-inclusive price, or add VAT to a net price.",
  category: "finance",
  icon: FileText,
  keywords: ["vat", "value added tax", "gst", "tax inclusive price"],
  inputs: [
    {
      name: "mode",
      label: "Calculation type",
      kind: "segmented",
      defaultValue: "extract",
      options: [
        { value: "extract", label: "Extract VAT from a price" },
        { value: "add", label: "Add VAT to a net price" },
      ],
    },
    { name: "amount", label: "Amount", kind: "currency", defaultValue: "", required: true },
    { name: "vatRate", label: "VAT / GST rate (%)", kind: "percentage", defaultValue: "18", required: true },
  ],
  schema: vatSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  dynamicLabels: (values) => ({
    amount: values.mode === "add" ? "Net amount (excl. VAT)" : "Gross amount (incl. VAT)",
  }),
  formula: "Extract VAT: Net = Gross ÷ (1 + rate). Add VAT: Gross = Net × (1 + rate).",
  explanation: [
    {
      heading: "VAT-inclusive pricing",
      body: "Unlike US sales tax, VAT (or GST) is typically already included in displayed prices in most countries, which is why extracting the tax from a total is the more common calculation.",
    },
  ],
  faq: [
    { q: "Is this the same as GST?", a: "GST (Goods and Services Tax) works the same way mathematically as VAT — just enter your local GST rate." },
  ],
  related: ["sales-tax", "discount", "margin"],
};
