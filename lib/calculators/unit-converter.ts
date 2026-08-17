import { Ruler } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";

type UnitDef = { label: string; category: string; toBase: (v: number) => number; fromBase: (v: number) => number };

const UNITS: Record<string, UnitDef> = {
  // Length (base: meters)
  meter: { label: "Meters (length)", category: "length", toBase: (v) => v, fromBase: (v) => v },
  kilometer: { label: "Kilometers (length)", category: "length", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
  centimeter: { label: "Centimeters (length)", category: "length", toBase: (v) => v * 0.01, fromBase: (v) => v / 0.01 },
  millimeter: { label: "Millimeters (length)", category: "length", toBase: (v) => v * 0.001, fromBase: (v) => v / 0.001 },
  mile: { label: "Miles (length)", category: "length", toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
  yard: { label: "Yards (length)", category: "length", toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
  foot: { label: "Feet (length)", category: "length", toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
  inch: { label: "Inches (length)", category: "length", toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
  // Weight (base: kilograms)
  kilogram: { label: "Kilograms (weight)", category: "weight", toBase: (v) => v, fromBase: (v) => v },
  gram: { label: "Grams (weight)", category: "weight", toBase: (v) => v * 0.001, fromBase: (v) => v / 0.001 },
  pound: { label: "Pounds (weight)", category: "weight", toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592 },
  ounce: { label: "Ounces (weight)", category: "weight", toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },
  metricTon: { label: "Metric tons (weight)", category: "weight", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
  // Volume (base: liters)
  liter: { label: "Liters (volume)", category: "volume", toBase: (v) => v, fromBase: (v) => v },
  milliliter: { label: "Milliliters (volume)", category: "volume", toBase: (v) => v * 0.001, fromBase: (v) => v / 0.001 },
  usGallon: { label: "US Gallons (volume)", category: "volume", toBase: (v) => v * 3.78541, fromBase: (v) => v / 3.78541 },
  usQuart: { label: "US Quarts (volume)", category: "volume", toBase: (v) => v * 0.946353, fromBase: (v) => v / 0.946353 },
  usCup: { label: "US Cups (volume)", category: "volume", toBase: (v) => v * 0.24, fromBase: (v) => v / 0.24 },
  // Temperature (base: celsius)
  celsius: { label: "Celsius (temperature)", category: "temperature", toBase: (v) => v, fromBase: (v) => v },
  fahrenheit: { label: "Fahrenheit (temperature)", category: "temperature", toBase: (v) => ((v - 32) * 5) / 9, fromBase: (v) => (v * 9) / 5 + 32 },
  kelvin: { label: "Kelvin (temperature)", category: "temperature", toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
};

const UNIT_KEYS = Object.keys(UNITS) as [string, ...string[]];

export const unitConverterSchema = z
  .object({
    fromUnit: selectField(UNIT_KEYS, "From unit"),
    value: numberField({ label: "Value" }),
    toUnit: selectField(UNIT_KEYS, "To unit"),
  })
  .superRefine((data, ctx) => {
    if (UNITS[data.fromUnit].category !== UNITS[data.toUnit].category) {
      ctx.addIssue({ code: "custom", path: ["toUnit"], message: "Both units must be the same type (e.g. both length, or both weight)" });
    }
  });

export type UnitConverterValues = z.infer<typeof unitConverterSchema>;

function calculate(values: UnitConverterValues): CalcResult {
  const from = UNITS[values.fromUnit];
  const to = UNITS[values.toUnit];
  const base = from.toBase(values.value);
  const result = to.fromBase(base);

  return {
    primary: { key: "result", label: `${values.value} ${from.label.split(" (")[0]} =`, value: Math.round(result * 1e8) / 1e8, format: "number", unit: to.label.split(" (")[0] },
    secondary: [],
  };
}

export const unitConverterCalculator: CalculatorDef = {
  id: "unit-converter",
  slug: "unit-converter",
  title: "Unit Converter",
  description: "Convert between units of length, weight, volume, and temperature.",
  category: "conversion",
  icon: Ruler,
  keywords: ["unit converter", "conversion calculator", "metric to imperial", "temperature converter"],
  inputs: [
    { name: "value", label: "Value", kind: "number", defaultValue: "1", step: 0.01, required: true },
    {
      name: "fromUnit",
      label: "From unit",
      kind: "select",
      defaultValue: "meter",
      options: UNIT_KEYS.map((k) => ({ value: k, label: UNITS[k].label })),
    },
    {
      name: "toUnit",
      label: "To unit",
      kind: "select",
      defaultValue: "foot",
      options: UNIT_KEYS.map((k) => ({ value: k, label: UNITS[k].label })),
    },
  ],
  schema: unitConverterSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Each unit converts to a category base unit (meters, kilograms, liters, or Celsius), then from the base unit to the target unit.",
  explanation: [
    {
      heading: "Units must match category",
      body: "You can convert meters to feet (both length), but not meters to kilograms — pick both units from the same category (shown in parentheses).",
    },
  ],
  faq: [
    { q: "Why is temperature conversion different?", a: "Unlike length or weight, temperature scales don't share a common zero point, so conversions use offset formulas rather than a simple multiplication factor." },
  ],
  related: ["shoe-size", "tire-size"],
};
