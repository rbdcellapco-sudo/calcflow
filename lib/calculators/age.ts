import { CalendarClock } from "lucide-react";
import { z } from "zod";
import {
  differenceInCalendarDays,
  differenceInCalendarWeeks,
  differenceInMonths,
  differenceInYears,
  intervalToDuration,
  addYears,
  isAfter,
  isValid,
  parseISO,
} from "date-fns";
import type { CalcResult, CalculatorDef } from "../types";
import { dateField } from "../validation";

export const ageSchema = z
  .object({
    birthDate: dateField("Date of birth"),
    asOfDate: z
      .string()
      .optional()
      .transform((v) => (v && v.trim() ? v : new Date().toISOString().slice(0, 10))),
  })
  .superRefine((data, ctx) => {
    const birth = parseISO(data.birthDate);
    const asOf = parseISO(data.asOfDate);
    if (!isValid(birth)) {
      ctx.addIssue({ code: "custom", path: ["birthDate"], message: "Date of birth must be a valid date" });
      return;
    }
    if (!isValid(asOf)) {
      ctx.addIssue({ code: "custom", path: ["asOfDate"], message: "Reference date must be a valid date" });
      return;
    }
    if (isAfter(birth, asOf)) {
      ctx.addIssue({ code: "custom", path: ["birthDate"], message: "Date of birth must be before the reference date" });
    }
  });

export type AgeValues = z.infer<typeof ageSchema>;

function calculate(values: AgeValues): CalcResult {
  const birth = parseISO(values.birthDate);
  const asOf = parseISO(values.asOfDate);

  const duration = intervalToDuration({ start: birth, end: asOf });
  const totalDays = differenceInCalendarDays(asOf, birth);
  const totalWeeks = differenceInCalendarWeeks(asOf, birth);
  const totalMonths = differenceInMonths(asOf, birth);
  const years = differenceInYears(asOf, birth);

  let nextBirthday = addYears(birth, years + (isAfter(asOf, addYears(birth, years)) ? 1 : 0));
  if (nextBirthday.getTime() === asOf.getTime()) {
    nextBirthday = addYears(nextBirthday, 1);
  }
  const daysToNextBirthday = differenceInCalendarDays(nextBirthday, asOf);

  const ageLabel = `${duration.years ?? 0}y ${duration.months ?? 0}m ${duration.days ?? 0}d`;

  return {
    primary: { key: "age", label: "Age", value: ageLabel, format: "text" },
    secondary: [
      { key: "years", label: "Years", value: years, format: "number" },
      { key: "totalMonths", label: "Total months", value: totalMonths, format: "number" },
      { key: "totalWeeks", label: "Total weeks", value: totalWeeks, format: "number" },
      { key: "totalDays", label: "Total days", value: totalDays, format: "number" },
      {
        key: "nextBirthday",
        label: "Days until next birthday",
        value: daysToNextBirthday,
        format: "number",
      },
    ],
  };
}

export const ageCalculator: CalculatorDef = {
  id: "age",
  slug: "age",
  title: "Age Calculator",
  description: "Calculate exact age in years, months, and days between two dates.",
  category: "date",
  icon: CalendarClock,
  keywords: ["birthday", "how old am i", "date of birth", "years old"],
  inputs: [
    { name: "birthDate", label: "Date of birth", kind: "date", required: true },
    { name: "asOfDate", label: "Calculate age as of", kind: "date", helpText: "Defaults to today" },
  ],
  schema: ageSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Age is the calendar difference between the date of birth and the reference date, broken into years, months, and days.",
  explanation: [
    {
      heading: "How age is calculated",
      body: "This calculator accounts for leap years and varying month lengths by computing a true calendar interval, not just dividing total days by 365.",
    },
  ],
  faq: [
    { q: "Does this handle leap years correctly?", a: "Yes. The calculation uses calendar-aware date arithmetic so leap years never throw off the result." },
  ],
  related: ["date-duration"],
};
