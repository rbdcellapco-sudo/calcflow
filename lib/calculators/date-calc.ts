import { Calendar } from "lucide-react";
import { z } from "zod";
import { addDays, addMonths, addYears, differenceInCalendarDays, format as formatDate, isValid, parseISO } from "date-fns";
import type { CalcResult, CalculatorDef } from "../types";
import { dateField, numberField, selectField } from "../validation";

const MODES = ["difference", "add-subtract"] as const;
const UNITS = ["days", "weeks", "months", "years"] as const;
const DIRECTIONS = ["add", "subtract"] as const;

export const dateCalcSchema = z
  .object({
    mode: selectField(MODES, "Mode"),
    startDate: dateField("Start date"),
    endDate: z.string().optional(),
    amount: numberField({ label: "Amount", min: 0, max: 100000, integer: true, required: false }),
    unit: selectField(UNITS, "Unit").optional(),
    direction: selectField(DIRECTIONS, "Direction").optional(),
  })
  .superRefine((data, ctx) => {
    if (!isValid(parseISO(data.startDate))) {
      ctx.addIssue({ code: "custom", path: ["startDate"], message: "Must be a valid date" });
    }
    if (data.mode === "difference") {
      if (!data.endDate || !isValid(parseISO(data.endDate))) {
        ctx.addIssue({ code: "custom", path: ["endDate"], message: "Must be a valid date" });
      }
    }
  });

export type DateCalcValues = z.infer<typeof dateCalcSchema>;

function calculate(values: DateCalcValues): CalcResult {
  const start = parseISO(values.startDate);

  if (values.mode === "difference") {
    const end = parseISO(values.endDate!);
    const days = Math.abs(differenceInCalendarDays(end, start));
    return {
      primary: { key: "days", label: "Days between", value: days, format: "number" },
      secondary: [
        { key: "weeks", label: "Weeks", value: Math.round((days / 7) * 100) / 100, format: "number" },
        { key: "months", label: "Approx. months", value: Math.round((days / 30.44) * 100) / 100, format: "number" },
        { key: "years", label: "Approx. years", value: Math.round((days / 365.25) * 100) / 100, format: "number" },
      ],
    };
  }

  const amount = values.amount ?? 0;
  const signedAmount = values.direction === "subtract" ? -amount : amount;
  let resultDate: Date;
  switch (values.unit) {
    case "weeks": resultDate = addDays(start, signedAmount * 7); break;
    case "months": resultDate = addMonths(start, signedAmount); break;
    case "years": resultDate = addYears(start, signedAmount); break;
    default: resultDate = addDays(start, signedAmount);
  }

  return {
    primary: { key: "resultDate", label: "Result date", value: formatDate(resultDate, "EEEE, MMMM d, yyyy"), format: "text" },
    secondary: [],
  };
}

export const dateCalcCalculator: CalculatorDef = {
  id: "date-calc",
  slug: "date-calc",
  title: "Date Calculator",
  description: "Find the number of days between two dates, or add/subtract time from a date.",
  category: "date",
  icon: Calendar,
  keywords: ["date difference", "days between dates", "add days to date", "day counter"],
  inputs: [
    {
      name: "mode",
      label: "Mode",
      kind: "segmented",
      defaultValue: "difference",
      options: [
        { value: "difference", label: "Days between two dates" },
        { value: "add-subtract", label: "Add/subtract from a date" },
      ],
    },
    { name: "startDate", label: "Start date", kind: "date", required: true },
    { name: "endDate", label: "End date", kind: "date" },
  ],
  advancedInputs: [
    { name: "amount", label: "Amount", kind: "number", defaultValue: "1", min: 0, max: 100000, step: 1, required: false },
    {
      name: "direction",
      label: "Direction",
      kind: "segmented",
      defaultValue: "add",
      options: [
        { value: "add", label: "Add" },
        { value: "subtract", label: "Subtract" },
      ],
    },
    {
      name: "unit",
      label: "Unit",
      kind: "select",
      defaultValue: "days",
      options: [
        { value: "days", label: "Days" },
        { value: "weeks", label: "Weeks" },
        { value: "months", label: "Months" },
        { value: "years", label: "Years" },
      ],
    },
  ],
  schema: dateCalcSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  dynamicLabels: (values) => ({ endDate: values.mode === "add-subtract" ? "(not used in this mode)" : "End date" }),
  formula: "Difference mode counts calendar days between two dates. Add/subtract mode shifts a date forward or backward by a chosen amount.",
  explanation: [
    {
      heading: "Calendar-aware arithmetic",
      body: "Adding months or years accounts for varying month lengths and leap years rather than using a fixed day count.",
    },
  ],
  faq: [
    { q: "Does this include or exclude the start date?", a: "The day difference counts full calendar days between the two dates — the start date itself isn't counted as one of the elapsed days." },
  ],
  related: ["age", "day-of-week", "time-calc"],
};
