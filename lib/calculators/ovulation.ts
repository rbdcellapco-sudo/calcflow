import { Flower2 } from "lucide-react";
import { z } from "zod";
import { addDays, format as formatDate, isAfter, isValid, parseISO } from "date-fns";
import type { CalcResult, CalculatorDef } from "../types";
import { dateField, numberField } from "../validation";

export const ovulationSchema = z
  .object({
    lastPeriodStart: dateField("First day of last period"),
    cycleLength: numberField({ label: "Average cycle length", min: 20, max: 45 }),
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

export type OvulationValues = z.infer<typeof ovulationSchema>;

function calculate(values: OvulationValues): CalcResult {
  const lmp = parseISO(values.lastPeriodStart);
  const ovulationDate = addDays(lmp, values.cycleLength - 14);
  const fertileStart = addDays(ovulationDate, -5);
  const fertileEnd = addDays(ovulationDate, 1);
  const nextPeriod = addDays(lmp, values.cycleLength);

  return {
    primary: { key: "ovulationDate", label: "Estimated ovulation date", value: formatDate(ovulationDate, "MMMM d, yyyy"), format: "text" },
    secondary: [
      { key: "fertileWindow", label: "Fertile window", value: `${formatDate(fertileStart, "MMM d")} – ${formatDate(fertileEnd, "MMM d, yyyy")}`, format: "text" },
      { key: "nextPeriod", label: "Next period (estimated)", value: formatDate(nextPeriod, "MMMM d, yyyy"), format: "text" },
    ],
    notes: ["Assumes a consistent luteal phase of about 14 days, which is the most stable part of the cycle. Actual ovulation timing varies and is best confirmed with ovulation tests or tracking basal body temperature."],
  };
}

export const ovulationCalculator: CalculatorDef = {
  id: "ovulation",
  slug: "ovulation",
  title: "Ovulation Calculator",
  description: "Estimate your ovulation date and fertile window from your cycle.",
  category: "health",
  icon: Flower2,
  keywords: ["ovulation", "fertile window", "conception", "fertility calculator"],
  inputs: [
    { name: "lastPeriodStart", label: "First day of last period", kind: "date", required: true },
    { name: "cycleLength", label: "Average cycle length (days)", kind: "number", defaultValue: "28", min: 20, max: 45, step: 1, required: true },
  ],
  schema: ovulationSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Ovulation date ≈ Last period start + (cycle length − 14 days). Fertile window spans roughly 5 days before to 1 day after ovulation.",
  explanation: [
    {
      heading: "Why the luteal phase is the anchor",
      body: "The follicular phase (before ovulation) varies significantly between cycles, but the luteal phase (after ovulation, before the next period) is much more consistent at around 14 days — which is why ovulation is estimated by counting backward from the next expected period.",
    },
  ],
  faq: [
    { q: "How accurate is this estimate?", a: "It's a statistical estimate based on average cycle patterns. Cycle-to-cycle variation, especially with irregular cycles, can shift actual ovulation by several days." },
  ],
  related: ["due-date", "period", "pregnancy-weight-gain"],
};
