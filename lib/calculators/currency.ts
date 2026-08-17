import { ArrowRightLeft } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";

export const currencySchema = z.object({
  amount: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export type CurrencyValues = z.infer<typeof currencySchema>;

// The custom CurrencyCalculator component handles conversion itself using
// live (cached) exchange rates — this calculate() is never called by the
// shell for a custom:true calculator, but is kept for type consistency.
function calculate(): CalcResult {
  return {
    primary: { key: "result", label: "Result", value: 0, format: "number" },
    secondary: [],
  };
}

export const currencyCalculator: CalculatorDef = {
  id: "currency",
  slug: "currency",
  title: "Currency Calculator",
  description: "Convert between currencies using live exchange rates, cached for offline use.",
  category: "conversion",
  icon: ArrowRightLeft,
  keywords: ["currency converter", "exchange rate", "forex", "money conversion"],
  inputs: [],
  schema: currencySchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  custom: true,
  formula: "Converted amount = Amount ÷ (rate of the 'from' currency vs. USD) × (rate of the 'to' currency vs. USD).",
  explanation: [
    {
      heading: "Rates are cached for offline use",
      body: "Exchange rates are fetched from a free live-rate service and cached on your device. If you're offline, the calculator falls back to the most recently cached rates and shows how old they are.",
    },
  ],
  faq: [
    { q: "How often do rates update?", a: "Rates refresh automatically after 12 hours, or any time you tap Refresh while online." },
  ],
  related: ["sales-tax", "inflation"],
};
