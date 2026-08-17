import { Dice6 } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";

export const diceRollerSchema = z.object({
  numDice: numberField({ label: "Number of dice", min: 1, max: 20, integer: true }),
  sides: numberField({ label: "Sides per die", min: 2, max: 100, integer: true }),
});

export type DiceRollerValues = z.infer<typeof diceRollerSchema>;

function calculate(values: DiceRollerValues): CalcResult {
  const rolls = Array.from({ length: values.numDice }, () => Math.floor(Math.random() * values.sides) + 1);
  const total = rolls.reduce((a, b) => a + b, 0);

  return {
    primary: { key: "total", label: "Total", value: total, format: "number" },
    secondary: [{ key: "rolls", label: "Individual rolls", value: rolls.join(", "), format: "text" }],
  };
}

export const diceRollerCalculator: CalculatorDef = {
  id: "dice-roller",
  slug: "dice-roller",
  title: "Dice Roller",
  description: "Roll any number of dice with any number of sides.",
  category: "other",
  icon: Dice6,
  keywords: ["dice roller", "roll dice", "d20", "d6", "random dice"],
  inputs: [
    { name: "numDice", label: "Number of dice", kind: "number", defaultValue: "2", min: 1, max: 20, step: 1, required: true },
    { name: "sides", label: "Sides per die", kind: "number", defaultValue: "6", min: 2, max: 100, step: 1, required: true },
  ],
  schema: diceRollerSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Each die independently produces a uniformly random integer between 1 and the number of sides.",
  explanation: [
    {
      heading: "Recalculate to reroll",
      body: "Every time you hit Calculate, all dice are rolled again fresh.",
    },
  ],
  faq: [
    { q: "Can I roll a d20 for tabletop games?", a: "Yes — set sides to 20 and number of dice to however many you need." },
  ],
  related: ["random-number"],
};
