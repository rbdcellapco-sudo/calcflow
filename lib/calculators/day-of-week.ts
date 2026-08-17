import { CalendarDays } from "lucide-react";
import { z } from "zod";
import { format as formatDate, isValid, parseISO } from "date-fns";
import type { CalcResult, CalculatorDef } from "../types";
import { dateField } from "../validation";

export const dayOfWeekSchema = z.object({
  date: dateField("Date"),
}).superRefine((data, ctx) => {
  if (!isValid(parseISO(data.date))) {
    ctx.addIssue({ code: "custom", path: ["date"], message: "Must be a valid date" });
  }
});

export type DayOfWeekValues = z.infer<typeof dayOfWeekSchema>;

function calculate(values: DayOfWeekValues): CalcResult {
  const date = parseISO(values.date);

  return {
    primary: { key: "dayOfWeek", label: "Day of the week", value: formatDate(date, "EEEE"), format: "text" },
    secondary: [{ key: "fullDate", label: "Full date", value: formatDate(date, "MMMM d, yyyy"), format: "text" }],
  };
}

export const dayOfWeekCalculator: CalculatorDef = {
  id: "day-of-week",
  slug: "day-of-week",
  title: "Day of the Week Calculator",
  description: "Find out what day of the week any date falls on, past or future.",
  category: "date",
  icon: CalendarDays,
  keywords: ["day of the week", "what day was", "what day will it be"],
  inputs: [{ name: "date", label: "Date", kind: "date", required: true }],
  schema: dayOfWeekSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Uses the Gregorian calendar's standard weekday cycle to determine the day of the week for any date.",
  explanation: [
    {
      heading: "Works for any date",
      body: "This works correctly for dates far in the past or future, correctly accounting for leap years along the way.",
    },
  ],
  faq: [
    { q: "Does this work for historical dates before calendar reforms?", a: "This uses the modern Gregorian calendar throughout — dates before its adoption in a given region may not match historical records exactly." },
  ],
  related: ["date-calc", "age"],
};
