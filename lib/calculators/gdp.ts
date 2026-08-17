import { LineChart } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef, ResultValue } from "../types";
import { numberField } from "../validation";

export const gdpSchema = z.object({
  consumption: numberField({ label: "Consumption (C)", min: 0 }),
  investment: numberField({ label: "Investment (I)", min: 0 }),
  governmentSpending: numberField({ label: "Government spending (G)", min: 0 }),
  exports: numberField({ label: "Exports (X)", min: 0 }),
  imports: numberField({ label: "Imports (M)", min: 0 }),
  population: numberField({ label: "Population", min: 1, required: false }),
});

export type GdpValues = z.infer<typeof gdpSchema>;

function calculate(values: GdpValues): CalcResult {
  const netExports = values.exports - values.imports;
  const gdp = values.consumption + values.investment + values.governmentSpending + netExports;

  const secondary: ResultValue[] = [
    { key: "netExports", label: "Net exports (X − M)", value: netExports, format: "number" },
  ];

  if (values.population) {
    const gdpPerCapita = gdp / values.population;
    secondary.push({ key: "gdpPerCapita", label: "GDP per capita", value: Math.round(gdpPerCapita * 100) / 100, format: "currency" as const });
  }

  return {
    primary: { key: "gdp", label: "GDP", value: gdp, format: "currency" },
    secondary,
  };
}

export const gdpCalculator: CalculatorDef = {
  id: "gdp",
  slug: "gdp",
  title: "GDP Calculator",
  description: "Calculate Gross Domestic Product using the expenditure approach.",
  category: "other",
  icon: LineChart,
  keywords: ["gdp calculator", "gross domestic product", "gdp per capita", "expenditure approach"],
  inputs: [
    { name: "consumption", label: "Consumption (C)", kind: "currency", defaultValue: "", required: true },
    { name: "investment", label: "Investment (I)", kind: "currency", defaultValue: "", required: true },
    { name: "governmentSpending", label: "Government spending (G)", kind: "currency", defaultValue: "", required: true },
    { name: "exports", label: "Exports (X)", kind: "currency", defaultValue: "", required: true },
    { name: "imports", label: "Imports (M)", kind: "currency", defaultValue: "", required: true },
  ],
  advancedInputs: [
    { name: "population", label: "Population (optional)", kind: "number", defaultValue: "", min: 1, required: false, helpText: "Enter to also see GDP per capita." },
  ],
  schema: gdpSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "GDP = C + I + G + (X − M), the expenditure approach: consumption + investment + government spending + net exports.",
  explanation: [
    {
      heading: "One of three GDP approaches",
      body: "The expenditure approach (used here) sums total spending in an economy. The income and production approaches measure the same underlying GDP from different angles and should, in theory, arrive at the same total.",
    },
  ],
  faq: [
    { q: "What if imports exceed exports?", a: "Net exports (X − M) becomes negative, which reduces GDP — this reflects that imported goods were produced elsewhere, not domestically." },
  ],
  related: ["inflation"],
};
