import { AlertTriangle } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";

export const percentErrorSchema = z.object({
  experimentalValue: numberField({ label: "Experimental (measured) value" }),
  theoreticalValue: numberField({ label: "Theoretical (accepted) value" }),
});

export type PercentErrorValues = z.infer<typeof percentErrorSchema>;

function calculate(values: PercentErrorValues): CalcResult {
  const { experimentalValue, theoreticalValue } = values;
  if (theoreticalValue === 0) throw new Error("Theoretical value can't be zero");

  const percentError = (Math.abs(experimentalValue - theoreticalValue) / Math.abs(theoreticalValue)) * 100;
  const signedError = ((experimentalValue - theoreticalValue) / Math.abs(theoreticalValue)) * 100;

  return {
    primary: { key: "percentError", label: "Percent error", value: Math.round(percentError * 1000) / 1000, format: "percentage" },
    secondary: [{ key: "signedError", label: "Signed error (direction)", value: Math.round(signedError * 1000) / 1000, format: "percentage" }],
  };
}

export const percentErrorCalculator: CalculatorDef = {
  id: "percent-error",
  slug: "percent-error",
  title: "Percent Error Calculator",
  description: "Compare a measured value to an accepted value and calculate the percent error.",
  category: "math",
  icon: AlertTriangle,
  keywords: ["percent error", "experimental error", "measurement accuracy"],
  inputs: [
    { name: "experimentalValue", label: "Experimental (measured) value", kind: "number", defaultValue: "", step: 0.0001, required: true },
    { name: "theoreticalValue", label: "Theoretical (accepted) value", kind: "number", defaultValue: "", step: 0.0001, required: true },
  ],
  schema: percentErrorSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Percent error = |Experimental − Theoretical| ÷ |Theoretical| × 100.",
  explanation: [
    {
      heading: "Signed vs. absolute error",
      body: "Percent error is usually reported as a positive (absolute) figure, but the signed version tells you whether the measurement overshot or undershot the accepted value.",
    },
  ],
  faq: [
    { q: "What's a 'good' percent error?", a: "It depends entirely on the field and measurement method — some lab experiments target under 5%, while others accept much wider tolerances." },
  ],
  related: ["percentage", "rounding"],
};
