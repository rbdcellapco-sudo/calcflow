import { Baby } from "lucide-react";
import { z } from "zod";
import { addDays, differenceInCalendarDays, format as formatDate, isAfter, isValid, parseISO } from "date-fns";
import type { CalcResult, CalculatorDef } from "../types";
import { dateField, numberField, selectField } from "../validation";

const MODES = ["lmp", "conception"] as const;

export const dueDateSchema = z
  .object({
    mode: selectField(MODES, "Mode"),
    date: dateField("Date"),
    cycleLength: numberField({ label: "Average cycle length", min: 20, max: 45, required: false }),
  })
  .superRefine((data, ctx) => {
    const d = parseISO(data.date);
    if (!isValid(d)) {
      ctx.addIssue({ code: "custom", path: ["date"], message: "Must be a valid date" });
      return;
    }
    if (isAfter(d, new Date())) {
      ctx.addIssue({ code: "custom", path: ["date"], message: "Date can't be in the future" });
    }
  });

export type DueDateValues = z.infer<typeof dueDateSchema>;

function calculate(values: DueDateValues): CalcResult {
  const startDate = parseISO(values.date);
  const cycleLength = values.cycleLength ?? 28;

  const dueDate =
    values.mode === "lmp"
      ? addDays(startDate, 280 + (cycleLength - 28))
      : addDays(startDate, 266);

  const today = new Date();
  const conceptionDate = values.mode === "lmp" ? addDays(startDate, cycleLength - 14) : startDate;
  const gestationDays = Math.max(differenceInCalendarDays(today, values.mode === "lmp" ? startDate : addDays(startDate, -14)), 0);
  const gestationWeeks = Math.floor(gestationDays / 7);
  const gestationRemDays = gestationDays % 7;

  let trimester = 1;
  if (gestationWeeks >= 27) trimester = 3;
  else if (gestationWeeks >= 13) trimester = 2;

  return {
    primary: { key: "dueDate", label: "Estimated due date", value: formatDate(dueDate, "MMMM d, yyyy"), format: "text" },
    secondary: [
      { key: "gestationalAge", label: "Current gestational age", value: `${gestationWeeks}w ${gestationRemDays}d`, format: "text" },
      { key: "trimester", label: "Trimester", value: trimester, format: "number" },
      { key: "conceptionDate", label: "Estimated conception date", value: formatDate(conceptionDate, "MMMM d, yyyy"), format: "text" },
    ],
    notes: ["Naegele's rule (used here) is a standard estimate — only about 5% of babies are born exactly on their due date. Your care provider's ultrasound-based estimate is more precise."],
  };
}

export const dueDateCalculator: CalculatorDef = {
  id: "due-date",
  slug: "due-date",
  title: "Due Date Calculator",
  description: "Estimate your pregnancy due date from your last period or conception date.",
  category: "health",
  icon: Baby,
  keywords: ["due date", "pregnancy calculator", "naegele's rule", "conception date", "gestational age"],
  inputs: [
    {
      name: "mode",
      label: "Calculate from",
      kind: "segmented",
      defaultValue: "lmp",
      options: [
        { value: "lmp", label: "Last period" },
        { value: "conception", label: "Conception date" },
      ],
    },
    { name: "date", label: "Date", kind: "date", required: true },
  ],
  advancedInputs: [
    { name: "cycleLength", label: "Average cycle length (days)", kind: "number", defaultValue: "28", min: 20, max: 45, step: 1, required: false },
  ],
  schema: dueDateSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  dynamicLabels: (values) => ({ date: values.mode === "conception" ? "Conception date" : "First day of last period" }),
  formula: "Naegele's rule: Due date = Last period + 280 days (adjusted for cycle length), or Conception date + 266 days.",
  explanation: [
    {
      heading: "An estimate, not a guarantee",
      body: "Due dates are calculated from averages and are refined over the course of a pregnancy by your care provider using ultrasound measurements.",
    },
  ],
  faq: [
    { q: "Why does cycle length matter?", a: "A longer or shorter average cycle shifts when ovulation actually occurred relative to the start of your last period, which shifts the due date estimate." },
  ],
  related: ["ovulation", "pregnancy-weight-gain", "period"],
};
