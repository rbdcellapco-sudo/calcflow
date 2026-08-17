import { Zap } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";

const SOLVE_FOR = ["voltage", "current", "resistance"] as const;

export const ohmsLawSchema = z.object({
  solveFor: selectField(SOLVE_FOR, "Solve for"),
  voltage: numberField({ label: "Voltage (V)", min: 0, required: false }),
  current: numberField({ label: "Current (A)", min: 0, required: false }),
  resistance: numberField({ label: "Resistance (Ω)", min: 0, required: false }),
});

export type OhmsLawValues = z.infer<typeof ohmsLawSchema>;

function calculate(values: OhmsLawValues): CalcResult {
  const { solveFor, voltage, current, resistance } = values;

  if (solveFor === "voltage") {
    if (current === undefined || resistance === undefined) throw new Error("Enter current and resistance");
    const v = current * resistance;
    return {
      primary: { key: "voltage", label: "Voltage", value: Math.round(v * 1000) / 1000, format: "number", unit: "V" },
      secondary: [{ key: "power", label: "Power", value: Math.round(v * current * 1000) / 1000, format: "number", unit: "W" }],
    };
  }

  if (solveFor === "current") {
    if (voltage === undefined || resistance === undefined) throw new Error("Enter voltage and resistance");
    if (resistance === 0) throw new Error("Resistance can't be zero");
    const i = voltage / resistance;
    return {
      primary: { key: "current", label: "Current", value: Math.round(i * 1000) / 1000, format: "number", unit: "A" },
      secondary: [{ key: "power", label: "Power", value: Math.round(voltage * i * 1000) / 1000, format: "number", unit: "W" }],
    };
  }

  if (voltage === undefined || current === undefined) throw new Error("Enter voltage and current");
  if (current === 0) throw new Error("Current can't be zero");
  const r = voltage / current;
  return {
    primary: { key: "resistance", label: "Resistance", value: Math.round(r * 1000) / 1000, format: "number", unit: "Ω" },
    secondary: [{ key: "power", label: "Power", value: Math.round(voltage * current * 1000) / 1000, format: "number", unit: "W" }],
  };
}

export const ohmsLawCalculator: CalculatorDef = {
  id: "ohms-law",
  slug: "ohms-law",
  title: "Ohm's Law Calculator",
  description: "Solve for voltage, current, or resistance using Ohm's law.",
  category: "other",
  icon: Zap,
  keywords: ["ohms law", "voltage current resistance", "v=ir", "electrical calculator"],
  inputs: [
    {
      name: "solveFor",
      label: "Solve for",
      kind: "segmented",
      defaultValue: "voltage",
      options: [
        { value: "voltage", label: "Voltage" },
        { value: "current", label: "Current" },
        { value: "resistance", label: "Resistance" },
      ],
    },
    { name: "voltage", label: "Voltage (V)", kind: "number", defaultValue: "", step: 0.01, required: false },
    { name: "current", label: "Current (A)", kind: "number", defaultValue: "", step: 0.01, required: false },
    { name: "resistance", label: "Resistance (Ω)", kind: "number", defaultValue: "", step: 0.01, required: false },
  ],
  schema: ohmsLawSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  dynamicLabels: (values) => {
    if (values.solveFor === "voltage") return { voltage: "Voltage (V) — calculated", current: "Current (A)", resistance: "Resistance (Ω)" };
    if (values.solveFor === "current") return { voltage: "Voltage (V)", current: "Current (A) — calculated", resistance: "Resistance (Ω)" };
    return { voltage: "Voltage (V)", current: "Current (A)", resistance: "Resistance (Ω) — calculated" };
  },
  formula: "V = I × R, where V is voltage, I is current, and R is resistance.",
  explanation: [
    {
      heading: "Leave the field you're solving for blank",
      body: "Fill in the two known values (for whichever pair applies) and this calculates the third, plus power (P = V × I).",
    },
  ],
  faq: [
    { q: "What if I enter all three values?", a: "The calculator only uses the two values relevant to what you're solving for and ignores the third." },
  ],
  related: ["resistor", "electricity-cost", "voltage-drop"],
};
