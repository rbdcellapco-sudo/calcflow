import { Percent } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";

const MODES = ["of", "change", "what-percent"] as const;

export const percentageSchema = z
  .object({
    mode: selectField(MODES, "Mode"),
    value1: numberField({ label: "First value" }),
    value2: numberField({ label: "Second value" }),
  })
  .superRefine((data, ctx) => {
    if (data.mode === "change" && data.value1 === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["value1"],
        message: "Starting value cannot be zero",
      });
    }
    if (data.mode === "what-percent" && data.value2 === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["value2"],
        message: "Whole amount cannot be zero",
      });
    }
  });

export type PercentageValues = z.infer<typeof percentageSchema>;

function calculate(values: PercentageValues): CalcResult {
  const { mode, value1, value2 } = values;

  if (mode === "of") {
    const result = (value1 / 100) * value2;
    return {
      primary: { key: "result", label: `${value1}% of ${value2}`, value: result, format: "number" },
      secondary: [
        { key: "percent", label: "Percentage", value: value1, format: "percentage" },
        { key: "base", label: "Of value", value: value2, format: "number" },
      ],
    };
  }

  if (mode === "what-percent") {
    const result = (value1 / value2) * 100;
    return {
      primary: {
        key: "result",
        label: `${value1} is what % of ${value2}`,
        value: result,
        format: "percentage",
      },
      secondary: [
        { key: "part", label: "Part", value: value1, format: "number" },
        { key: "whole", label: "Whole", value: value2, format: "number" },
      ],
    };
  }

  // mode === "change"
  const diff = value2 - value1;
  const pctChange = (diff / value1) * 100;
  const direction = diff >= 0 ? "increase" : "decrease";
  return {
    primary: {
      key: "result",
      label: `Percentage ${direction}`,
      value: Math.abs(pctChange),
      format: "percentage",
    },
    secondary: [
      { key: "from", label: "From", value: value1, format: "number" },
      { key: "to", label: "To", value: value2, format: "number" },
      { key: "difference", label: "Difference", value: diff, format: "number" },
    ],
    notes: [`Value ${direction}d by ${Math.abs(pctChange).toFixed(2)}%.`],
  };
}

export const percentageCalculator: CalculatorDef = {
  id: "percentage",
  slug: "percentage",
  title: "Percentage Calculator",
  description: "Find a percentage of a number, percentage change, or what percent one value is of another.",
  category: "math",
  icon: Percent,
  keywords: ["percent", "percentage change", "percentage increase", "percentage decrease", "ratio"],
  inputs: [
    {
      name: "mode",
      label: "Calculation type",
      kind: "segmented",
      defaultValue: "of",
      options: [
        { value: "of", label: "X% of Y" },
        { value: "what-percent", label: "X is % of Y" },
        { value: "change", label: "% Change" },
      ],
    },
    { name: "value1", label: "First value", kind: "number", defaultValue: "", step: 0.01 },
    { name: "value2", label: "Second value", kind: "number", defaultValue: "", step: 0.01 },
  ],
  schema: percentageSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  dynamicLabels: (values) => {
    switch (values.mode) {
      case "what-percent":
        return { value1: "Part", value2: "Whole" };
      case "change":
        return { value1: "From (starting value)", value2: "To (ending value)" };
      case "of":
      default:
        return { value1: "Percentage (%)", value2: "Of this number" };
    }
  },
  formula: "X% of Y = (X ÷ 100) × Y. Percentage change = ((New − Old) ÷ Old) × 100.",
  explanation: [
    {
      heading: "How percentages work",
      body: "A percentage is a fraction of 100. This calculator covers the three most common percentage questions: finding a percentage of a number, finding what percent one number is of another, and finding the percentage increase or decrease between two numbers.",
    },
  ],
  faq: [
    {
      q: "How do I calculate a percentage increase?",
      a: "Switch to '% Change', enter the starting value as 'From' and the new value as 'To'. The result shows the percentage increase or decrease.",
    },
  ],
  related: ["tip", "compound-interest"],
};
