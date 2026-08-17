import { CircuitBoard } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { selectField } from "../validation";

const COLORS = ["black", "brown", "red", "orange", "yellow", "green", "blue", "violet", "gray", "white"] as const;
const DIGIT_VALUE: Record<(typeof COLORS)[number], number> = {
  black: 0, brown: 1, red: 2, orange: 3, yellow: 4, green: 5, blue: 6, violet: 7, gray: 8, white: 9,
};
const MULTIPLIER_COLORS = [...COLORS, "gold", "silver"] as const;
const MULTIPLIER_VALUE: Record<(typeof MULTIPLIER_COLORS)[number], number> = {
  black: 1, brown: 10, red: 100, orange: 1000, yellow: 10000, green: 100000, blue: 1000000, violet: 10000000, gray: 100000000, white: 1000000000,
  gold: 0.1, silver: 0.01,
};
const TOLERANCE_COLORS = ["brown", "red", "green", "blue", "violet", "gray", "gold", "silver"] as const;
const TOLERANCE_VALUE: Record<(typeof TOLERANCE_COLORS)[number], number> = {
  brown: 1, red: 2, green: 0.5, blue: 0.25, violet: 0.1, gray: 0.05, gold: 5, silver: 10,
};

export const resistorSchema = z.object({
  band1: selectField(COLORS, "Band 1"),
  band2: selectField(COLORS, "Band 2"),
  multiplier: selectField(MULTIPLIER_COLORS, "Multiplier band"),
  tolerance: selectField(TOLERANCE_COLORS, "Tolerance band"),
});

export type ResistorValues = z.infer<typeof resistorSchema>;

function formatResistance(ohms: number): string {
  if (ohms >= 1e6) return `${Math.round((ohms / 1e6) * 1000) / 1000} MΩ`;
  if (ohms >= 1e3) return `${Math.round((ohms / 1e3) * 1000) / 1000} kΩ`;
  return `${Math.round(ohms * 1000) / 1000} Ω`;
}

function calculate(values: ResistorValues): CalcResult {
  const digits = DIGIT_VALUE[values.band1] * 10 + DIGIT_VALUE[values.band2];
  const resistance = digits * MULTIPLIER_VALUE[values.multiplier];
  const tolerance = TOLERANCE_VALUE[values.tolerance];

  return {
    primary: { key: "resistance", label: "Resistance", value: formatResistance(resistance), format: "text" },
    secondary: [
      { key: "tolerance", label: "Tolerance", value: `±${tolerance}%`, format: "text" },
      { key: "range", label: "Range", value: `${formatResistance(resistance * (1 - tolerance / 100))} – ${formatResistance(resistance * (1 + tolerance / 100))}`, format: "text" },
    ],
  };
}

export const resistorCalculator: CalculatorDef = {
  id: "resistor",
  slug: "resistor",
  title: "Resistor Color Code Calculator",
  description: "Decode a 4-band resistor's value from its color bands.",
  category: "other",
  icon: CircuitBoard,
  keywords: ["resistor color code", "resistor calculator", "resistor bands"],
  inputs: [
    { name: "band1", label: "Band 1 (1st digit)", kind: "select", defaultValue: "brown", options: COLORS.map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) })) },
    { name: "band2", label: "Band 2 (2nd digit)", kind: "select", defaultValue: "black", options: COLORS.map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) })) },
    { name: "multiplier", label: "Multiplier band", kind: "select", defaultValue: "red", options: MULTIPLIER_COLORS.map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) })) },
    { name: "tolerance", label: "Tolerance band", kind: "select", defaultValue: "gold", options: TOLERANCE_COLORS.map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) })) },
  ],
  schema: resistorSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Resistance = (Band1 digit × 10 + Band2 digit) × Multiplier, using the standard 4-band resistor color code.",
  explanation: [
    {
      heading: "Reading the bands in order",
      body: "Orient the resistor with the tolerance band (usually gold or silver) on the right — the first two bands from the left are digits, the third is the multiplier.",
    },
  ],
  faq: [
    { q: "What about 5-band resistors?", a: "5-band resistors use three digit bands for higher precision — this calculator covers the more common 4-band standard." },
  ],
  related: ["ohms-law", "electricity-cost"],
};
