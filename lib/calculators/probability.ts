import { Dices } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";

const EVENT_TYPES = ["independent-and", "independent-or", "mutually-exclusive-or"] as const;

export const probabilitySchema = z.object({
  eventType: selectField(EVENT_TYPES, "Event relationship"),
  probA: numberField({ label: "P(A)", min: 0, max: 100 }),
  probB: numberField({ label: "P(B)", min: 0, max: 100 }),
});

export type ProbabilityValues = z.infer<typeof probabilitySchema>;

function calculate(values: ProbabilityValues): CalcResult {
  const a = values.probA / 100;
  const b = values.probB / 100;
  let result: number;
  let label: string;

  switch (values.eventType) {
    case "independent-and":
      result = a * b;
      label = "P(A and B) — both occur";
      break;
    case "independent-or":
      result = a + b - a * b;
      label = "P(A or B) — at least one occurs";
      break;
    case "mutually-exclusive-or":
      result = a + b;
      label = "P(A or B) — mutually exclusive";
      break;
  }

  return {
    primary: { key: "result", label, value: Math.round(Math.min(result, 1) * 10000) / 100, format: "percentage" },
    secondary: [],
  };
}

export const probabilityCalculator: CalculatorDef = {
  id: "probability",
  slug: "probability",
  title: "Probability Calculator",
  description: "Calculate the combined probability of two events under different relationships.",
  category: "math",
  icon: Dices,
  keywords: ["probability", "independent events", "mutually exclusive", "and or probability"],
  inputs: [
    {
      name: "eventType",
      label: "Event relationship",
      kind: "select",
      defaultValue: "independent-and",
      options: [
        { value: "independent-and", label: "Independent — both occur (A and B)" },
        { value: "independent-or", label: "Independent — at least one (A or B)" },
        { value: "mutually-exclusive-or", label: "Mutually exclusive — either (A or B)" },
      ],
    },
    { name: "probA", label: "P(A) (%)", kind: "percentage", defaultValue: "", required: true },
    { name: "probB", label: "P(B) (%)", kind: "percentage", defaultValue: "", required: true },
  ],
  schema: probabilitySchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Independent AND: P(A)×P(B). Independent OR: P(A)+P(B)−P(A)×P(B). Mutually exclusive OR: P(A)+P(B).",
  explanation: [
    {
      heading: "Independent vs. mutually exclusive",
      body: "Independent events don't affect each other's odds (like two coin flips). Mutually exclusive events can't both happen (like rolling a 1 and a 6 on the same die roll) — they use different combination formulas.",
    },
  ],
  faq: [
    { q: "Can mutually exclusive events be independent?", a: "No — if two events are mutually exclusive, knowing one happened tells you the other definitely didn't, which makes them dependent by definition." },
  ],
  related: ["statistics", "permutation-combination"],
};
