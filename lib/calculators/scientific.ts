import { Calculator as CalculatorIcon } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { evaluateExpression, type AngleMode } from "../expression-parser";

export const scientificSchema = z.object({
  expression: z.string().trim().min(1, "Enter an expression"),
  angleMode: z.enum(["deg", "rad"]).default("deg"),
});

export type ScientificValues = z.infer<typeof scientificSchema>;

function calculate(values: ScientificValues): CalcResult {
  const result = evaluateExpression(values.expression, values.angleMode as AngleMode);
  return {
    primary: { key: "result", label: "Result", value: result, format: "number" },
    secondary: [{ key: "expression", label: "Expression", value: values.expression, format: "text" }],
  };
}

export const scientificCalculator: CalculatorDef = {
  id: "scientific",
  slug: "scientific",
  title: "Scientific Calculator",
  description: "A full scientific calculator with trig, logs, exponents, and memory - no eval, safe expression parsing.",
  category: "math",
  icon: CalculatorIcon,
  keywords: ["sin cos tan", "scientific", "engineering calculator", "log", "square root", "exponent"],
  inputs: [
    { name: "expression", label: "Expression", kind: "text", defaultValue: "" },
    {
      name: "angleMode",
      label: "Angle mode",
      kind: "segmented",
      defaultValue: "deg",
      options: [
        { value: "deg", label: "DEG" },
        { value: "rad", label: "RAD" },
      ],
    },
  ],
  schema: scientificSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  custom: true,
  formula: "Expressions are parsed with a hand-written recursive-descent parser (tokenizer → parser → evaluator). No eval() or new Function() is ever used.",
  explanation: [
    {
      heading: "Safe by design",
      body: "This calculator never executes arbitrary JavaScript. Input is tokenized and parsed into a small expression grammar (numbers, + − × ÷ ^ % ! parentheses, and named functions like sin/cos/ln) which is evaluated purely numerically.",
    },
  ],
  faq: [
    { q: "Is this safe from code injection?", a: "Yes. There is no eval() or Function() construction anywhere in the app - expressions are evaluated by a dedicated parser that only understands numbers and math operators." },
  ],
  related: ["percentage"],
};
