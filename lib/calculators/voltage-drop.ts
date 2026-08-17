import { TrendingDown } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";

// Ohms per 1000 ft for solid copper wire at common AWG sizes.
const WIRE_GAUGES = ["10", "12", "14", "16", "18", "20"] as const;
const OHMS_PER_1000FT: Record<(typeof WIRE_GAUGES)[number], number> = {
  "10": 0.9989, "12": 1.588, "14": 2.525, "16": 4.016, "18": 6.385, "20": 10.15,
};

export const voltageDropSchema = z.object({
  voltage: numberField({ label: "Source voltage", min: 0.01, max: 100_000 }),
  current: numberField({ label: "Current (amps)", min: 0, max: 10_000 }),
  distanceFeet: numberField({ label: "One-way distance (feet)", min: 0, max: 100_000 }),
  wireGauge: selectField(WIRE_GAUGES, "Wire gauge (AWG)"),
});

export type VoltageDropValues = z.infer<typeof voltageDropSchema>;

function calculate(values: VoltageDropValues): CalcResult {
  const ohmsPerFoot = OHMS_PER_1000FT[values.wireGauge] / 1000;
  const totalResistance = ohmsPerFoot * values.distanceFeet * 2; // round trip
  const voltageDrop = values.current * totalResistance;
  const percentDrop = (voltageDrop / values.voltage) * 100;
  const endVoltage = values.voltage - voltageDrop;

  return {
    primary: { key: "voltageDrop", label: "Voltage drop", value: Math.round(voltageDrop * 1000) / 1000, format: "number", unit: "V" },
    secondary: [
      { key: "percentDrop", label: "Percent drop", value: Math.round(percentDrop * 100) / 100, format: "percentage" },
      { key: "endVoltage", label: "Voltage at load", value: Math.round(endVoltage * 1000) / 1000, format: "number", unit: "V" },
    ],
    notes: percentDrop > 3 ? ["A drop over 3% is generally considered excessive for most circuits — consider a larger wire gauge or shorter run."] : undefined,
  };
}

export const voltageDropCalculator: CalculatorDef = {
  id: "voltage-drop",
  slug: "voltage-drop",
  title: "Voltage Drop Calculator",
  description: "Calculate voltage drop across a wire run based on gauge, current, and distance.",
  category: "other",
  icon: TrendingDown,
  keywords: ["voltage drop", "wire gauge calculator", "awg calculator"],
  inputs: [
    { name: "voltage", label: "Source voltage", kind: "number", defaultValue: "120", step: 0.1, required: true },
    { name: "current", label: "Current (amps)", kind: "number", defaultValue: "", step: 0.1, required: true },
    { name: "distanceFeet", label: "One-way distance (feet)", kind: "number", defaultValue: "", step: 1, required: true },
    {
      name: "wireGauge",
      label: "Wire gauge (AWG)",
      kind: "select",
      defaultValue: "12",
      options: WIRE_GAUGES.map((g) => ({ value: g, label: `${g} AWG` })),
    },
  ],
  schema: voltageDropSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Voltage drop = Current × (wire resistance per foot × round-trip distance).",
  explanation: [
    {
      heading: "Round-trip distance matters",
      body: "Current travels out to the load and back through the circuit, so this calculator doubles the one-way distance you enter when computing total wire resistance.",
    },
  ],
  faq: [
    { q: "What's an acceptable voltage drop?", a: "Electrical codes commonly recommend keeping voltage drop under 3% for branch circuits and under 5% total from source to the farthest outlet." },
  ],
  related: ["ohms-law", "electricity-cost"],
};
