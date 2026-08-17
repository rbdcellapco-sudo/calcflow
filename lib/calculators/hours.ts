import { Clock4 } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";

const TIME_RE = /^([01]?\d|2[0-3]):([0-5]\d)$/;

function timeField(label: string, required = true) {
  return z
    .string()
    .trim()
    .refine((v) => !required || v.length > 0, `${label} is required`)
    .refine((v) => !v || TIME_RE.test(v), `${label} must be in HH:MM 24-hour format`);
}

export const hoursSchema = z.object({
  day1In: timeField("Day 1 clock-in"),
  day1Out: timeField("Day 1 clock-out"),
  day2In: timeField("Day 2 clock-in", false),
  day2Out: timeField("Day 2 clock-out", false),
  day3In: timeField("Day 3 clock-in", false),
  day3Out: timeField("Day 3 clock-out", false),
  breakMinutes: numberField({ label: "Break (minutes per day)", min: 0, max: 480, required: false }),
  hourlyRate: numberField({ label: "Hourly rate", min: 0, required: false }),
});

export type HoursValues = z.infer<typeof hoursSchema>;

function minutesBetween(clockIn: string, clockOut: string): number {
  const [h1, m1] = clockIn.split(":").map(Number);
  const [h2, m2] = clockOut.split(":").map(Number);
  let diff = h2 * 60 + m2 - (h1 * 60 + m1);
  if (diff < 0) diff += 24 * 60; // overnight shift
  return diff;
}

function calculate(values: HoursValues): CalcResult {
  const breakMin = values.breakMinutes ?? 0;
  const days: [string, string][] = [[values.day1In, values.day1Out]];
  if (values.day2In && values.day2Out) days.push([values.day2In, values.day2Out]);
  if (values.day3In && values.day3Out) days.push([values.day3In, values.day3Out]);

  let totalMinutes = 0;
  for (const [inT, outT] of days) {
    totalMinutes += Math.max(minutesBetween(inT, outT) - breakMin, 0);
  }

  const totalHours = totalMinutes / 60;
  const secondary = [
    { key: "days", label: "Days entered", value: days.length, format: "number" as const },
  ];

  if (values.hourlyRate) {
    const pay = totalHours * values.hourlyRate;
    secondary.push({ key: "pay", label: "Total pay", value: Math.round(pay * 100) / 100, format: "number" as const });
  }

  return {
    primary: { key: "totalHours", label: "Total hours", value: Math.round(totalHours * 100) / 100, format: "number" },
    secondary,
  };
}

export const hoursCalculator: CalculatorDef = {
  id: "hours",
  slug: "hours",
  title: "Hours Calculator",
  description: "Calculate hours worked between clock-in and clock-out times, across up to 3 days.",
  category: "date",
  icon: Clock4,
  keywords: ["hours worked", "time card", "clock in clock out", "timesheet"],
  inputs: [
    { name: "day1In", label: "Clock-in (HH:MM)", kind: "text", defaultValue: "", required: true },
    { name: "day1Out", label: "Clock-out (HH:MM)", kind: "text", defaultValue: "", required: true },
  ],
  advancedInputs: [
    { name: "breakMinutes", label: "Break (minutes per day)", kind: "number", defaultValue: "0", min: 0, max: 480, required: false },
    { name: "hourlyRate", label: "Hourly rate (optional)", kind: "currency", defaultValue: "", required: false },
    { name: "day2In", label: "Day 2 clock-in (HH:MM)", kind: "text", defaultValue: "", required: false },
    { name: "day2Out", label: "Day 2 clock-out (HH:MM)", kind: "text", defaultValue: "", required: false },
    { name: "day3In", label: "Day 3 clock-in (HH:MM)", kind: "text", defaultValue: "", required: false },
    { name: "day3Out", label: "Day 3 clock-out (HH:MM)", kind: "text", defaultValue: "", required: false },
  ],
  schema: hoursSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Hours = (Clock-out − Clock-in) − break time, summed across every day entered. Shifts crossing midnight are handled automatically.",
  explanation: [
    {
      heading: "24-hour time format",
      body: "Enter times in 24-hour HH:MM format (e.g. 09:00 for 9am, 17:30 for 5:30pm) to avoid AM/PM ambiguity.",
    },
  ],
  faq: [
    { q: "Can I use this for a full week?", a: "This supports up to 3 days at once — for a full week, calculate a few days at a time and add the totals." },
  ],
  related: ["time-calc", "salary"],
};
