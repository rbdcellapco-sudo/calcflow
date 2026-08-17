import { Moon } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { selectField } from "../validation";

const MODES = ["wake-up", "bedtime"] as const;
const TIME_RE = /^([01]?\d|2[0-3]):([0-5]\d)$/;

export const sleepSchema = z.object({
  mode: selectField(MODES, "Mode"),
  time: z.string().trim().regex(TIME_RE, "Enter a time in HH:MM 24-hour format"),
  fallAsleepMinutes: z.string().optional(),
});

export type SleepValues = z.infer<typeof sleepSchema>;

function calculate(values: SleepValues): CalcResult {
  const [h, m] = values.time.split(":").map(Number);
  const fallAsleep = Number(values.fallAsleepMinutes || 15);
  const baseMinutes = h * 60 + m;

  const cycles = [6, 5, 4, 3];
  const results = cycles.map((cycleCount) => {
    const sleepMinutes = cycleCount * 90;
    const offset = values.mode === "wake-up" ? -(sleepMinutes + fallAsleep) : sleepMinutes + fallAsleep;
    let totalMinutes = (baseMinutes + offset) % (24 * 60);
    if (totalMinutes < 0) totalMinutes += 24 * 60;
    const hh = Math.floor(totalMinutes / 60);
    const mm = totalMinutes % 60;
    const label = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
    return { cycles: cycleCount, time: label, hours: Math.round((cycleCount * 1.5) * 10) / 10 };
  });

  return {
    primary: {
      key: "best",
      label: values.mode === "wake-up" ? "Recommended bedtime (6 cycles)" : "Recommended wake time (6 cycles)",
      value: results[0].time,
      format: "text",
    },
    secondary: results.slice(1).map((r) => ({
      key: `cycles${r.cycles}`,
      label: `${r.cycles} cycles (${r.hours}h)`,
      value: r.time,
      format: "text" as const,
    })),
    notes: ["Sleep cycles average about 90 minutes. Waking at the end of a cycle (rather than mid-cycle) tends to feel less groggy."],
  };
}

export const sleepCalculator: CalculatorDef = {
  id: "sleep",
  slug: "sleep",
  title: "Sleep Calculator",
  description: "Find the best bedtime or wake-up time based on 90-minute sleep cycles.",
  category: "other",
  icon: Moon,
  keywords: ["sleep calculator", "sleep cycles", "bedtime calculator", "wake up time"],
  inputs: [
    {
      name: "mode",
      label: "I know my...",
      kind: "segmented",
      defaultValue: "wake-up",
      options: [
        { value: "wake-up", label: "Wake-up time" },
        { value: "bedtime", label: "Bedtime" },
      ],
    },
    { name: "time", label: "Time (HH:MM)", kind: "text", defaultValue: "07:00", required: true },
  ],
  advancedInputs: [
    { name: "fallAsleepMinutes", label: "Minutes to fall asleep", kind: "number", defaultValue: "15", required: false },
  ],
  schema: sleepSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Each sleep cycle is modeled as 90 minutes. Bedtime/wake time options are calculated in whole-cycle increments (3-6 cycles) plus time to fall asleep.",
  explanation: [
    {
      heading: "Why whole cycles matter",
      body: "Waking up in the middle of a deep-sleep phase (mid-cycle) tends to cause grogginess, even with adequate total sleep — timing around full 90-minute cycles aims to avoid that.",
    },
  ],
  faq: [
    { q: "Is 90 minutes exact for everyone?", a: "No — actual cycle length varies by person (roughly 70-120 minutes) and even night to night, so treat these times as a helpful estimate rather than a precise target." },
  ],
  related: ["time-calc"],
};
