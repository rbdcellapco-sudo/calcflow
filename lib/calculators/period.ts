import { CalendarHeart } from "lucide-react";
import { z } from "zod";
import { addDays, format as formatDate, isAfter, isValid, parseISO } from "date-fns";
import type { CalcResult, CalculatorDef } from "../types";
import { dateField, numberField } from "../validation";

export const periodSchema = z
  .object({
    lastPeriodStart: dateField("First day of last period"),
    cycleLength: numberField({ label: "Average cycle length", min: 20, max: 45 }),
    periodLength: numberField({ label: "Average period length", min: 1, max: 14 }),
  })
  .superRefine((data, ctx) => {
    const d = parseISO(data.lastPeriodStart);
    if (!isValid(d)) {
      ctx.addIssue({ code: "custom", path: ["lastPeriodStart"], message: "Must be a valid date" });
      return;
    }
    if (isAfter(d, new Date())) {
      ctx.addIssue({ code: "custom", path: ["lastPeriodStart"], message: "Date can't be in the future" });
    }
  });

export type PeriodValues = z.infer<typeof periodSchema>;

function calculate(values: PeriodValues): CalcResult {
  const lmp = parseISO(values.lastPeriodStart);
  const cycles = [1, 2, 3].map((n) => {
    const start = addDays(lmp, values.cycleLength * n);
    const end = addDays(start, values.periodLength - 1);
    return `${formatDate(start, "MMM d")} – ${formatDate(end, "MMM d, yyyy")}`;
  });

  return {
    primary: { key: "nextPeriod", label: "Next period (estimated)", value: cycles[0], format: "text" },
    secondary: [
      { key: "cycle2", label: "Following cycle", value: cycles[1], format: "text" },
      { key: "cycle3", label: "Cycle after that", value: cycles[2], format: "text" },
    ],
  };
}

export const periodCalculator: CalculatorDef = {
  id: "period",
  slug: "period",
  title: "Period Calculator",
  description: "Predict your next few period dates based on your average cycle.",
  category: "health",
  icon: CalendarHeart,
  keywords: ["period calculator", "menstrual cycle", "period tracker", "next period"],
  inputs: [
    { name: "lastPeriodStart", label: "First day of last period", kind: "date", required: true },
    { name: "cycleLength", label: "Average cycle length (days)", kind: "number", defaultValue: "28", min: 20, max: 45, step: 1, required: true },
    { name: "periodLength", label: "Average period length (days)", kind: "number", defaultValue: "5", min: 1, max: 14, step: 1, required: true },
  ],
  schema: periodSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Next period start = Last period start + cycle length, repeated for future cycles.",
  explanation: [
    {
      heading: "Predictions assume a regular cycle",
      body: "This projects forward using your average cycle length — actual timing can shift due to stress, illness, travel, and many other factors, especially with irregular cycles.",
    },
  ],
  faq: [
    { q: "What if my cycle is irregular?", a: "These predictions become less reliable the more your cycle length varies month to month — tracking your actual cycles over time gives a better personal average." },
  ],
  related: ["ovulation", "due-date"],
};
