import { Clock } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";

const OPS = ["add", "subtract"] as const;

export const timeCalcSchema = z.object({
  h1: numberField({ label: "Hours 1", min: 0, max: 100000, integer: true }),
  m1: numberField({ label: "Minutes 1", min: 0, max: 59, integer: true }),
  s1: numberField({ label: "Seconds 1", min: 0, max: 59, integer: true, required: false }),
  op: selectField(OPS, "Operation"),
  h2: numberField({ label: "Hours 2", min: 0, max: 100000, integer: true }),
  m2: numberField({ label: "Minutes 2", min: 0, max: 59, integer: true }),
  s2: numberField({ label: "Seconds 2", min: 0, max: 59, integer: true, required: false }),
});

export type TimeCalcValues = z.infer<typeof timeCalcSchema>;

function calculate(values: TimeCalcValues): CalcResult {
  const total1 = values.h1 * 3600 + values.m1 * 60 + (values.s1 ?? 0);
  const total2 = values.h2 * 3600 + values.m2 * 60 + (values.s2 ?? 0);
  const resultSeconds = values.op === "add" ? total1 + total2 : total1 - total2;
  const sign = resultSeconds < 0 ? "-" : "";
  const abs = Math.abs(resultSeconds);

  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = abs % 60;

  return {
    primary: { key: "result", label: "Result", value: `${sign}${h}h ${m}m ${s}s`, format: "text" },
    secondary: [{ key: "totalSeconds", label: "Total seconds", value: resultSeconds, format: "number" }],
  };
}

export const timeCalcCalculator: CalculatorDef = {
  id: "time-calc",
  slug: "time-calc",
  title: "Time Calculator",
  description: "Add or subtract two time durations in hours, minutes, and seconds.",
  category: "date",
  icon: Clock,
  keywords: ["time addition", "time subtraction", "add time", "duration calculator"],
  inputs: [
    { name: "h1", label: "Hours 1", kind: "number", defaultValue: "", min: 0, step: 1, required: true },
    { name: "m1", label: "Minutes 1", kind: "number", defaultValue: "0", min: 0, max: 59, step: 1, required: true },
    {
      name: "op",
      label: "Operation",
      kind: "segmented",
      defaultValue: "add",
      options: [
        { value: "add", label: "+" },
        { value: "subtract", label: "−" },
      ],
    },
    { name: "h2", label: "Hours 2", kind: "number", defaultValue: "", min: 0, step: 1, required: true },
    { name: "m2", label: "Minutes 2", kind: "number", defaultValue: "0", min: 0, max: 59, step: 1, required: true },
  ],
  advancedInputs: [
    { name: "s1", label: "Seconds 1", kind: "number", defaultValue: "0", min: 0, max: 59, step: 1, required: false },
    { name: "s2", label: "Seconds 2", kind: "number", defaultValue: "0", min: 0, max: 59, step: 1, required: false },
  ],
  schema: timeCalcSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Converts both durations to total seconds, applies the operation, then converts back to hours/minutes/seconds.",
  explanation: [
    {
      heading: "Handles negative results",
      body: "Subtracting a larger duration from a smaller one gives a negative result, shown with a minus sign.",
    },
  ],
  faq: [
    { q: "Is this the same as clock time?", a: "No — this adds durations (like 2h 30m + 1h 45m), not clock times. Use the Hours Calculator to find the duration between two clock times." },
  ],
  related: ["hours", "date-calc"],
};
