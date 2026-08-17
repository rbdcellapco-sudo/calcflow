import { PieChart } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";

export const macroSchema = z
  .object({
    dailyCalories: numberField({ label: "Daily calorie target", min: 500, max: 20_000 }),
    proteinPercent: numberField({ label: "Protein %", min: 0, max: 100 }),
    carbPercent: numberField({ label: "Carbohydrate %", min: 0, max: 100 }),
    fatPercent: numberField({ label: "Fat %", min: 0, max: 100 }),
  })
  .superRefine((data, ctx) => {
    const total = data.proteinPercent + data.carbPercent + data.fatPercent;
    if (Math.abs(total - 100) > 1) {
      ctx.addIssue({ code: "custom", path: ["fatPercent"], message: `Percentages must add up to 100 (currently ${total})` });
    }
  });

export type MacroValues = z.infer<typeof macroSchema>;

function calculate(values: MacroValues): CalcResult {
  const proteinCalories = (values.dailyCalories * values.proteinPercent) / 100;
  const carbCalories = (values.dailyCalories * values.carbPercent) / 100;
  const fatCalories = (values.dailyCalories * values.fatPercent) / 100;

  const proteinGrams = proteinCalories / 4;
  const carbGrams = carbCalories / 4;
  const fatGrams = fatCalories / 9;

  return {
    primary: { key: "proteinGrams", label: "Protein", value: Math.round(proteinGrams), format: "number", unit: "g/day" },
    secondary: [
      { key: "carbGrams", label: "Carbohydrates", value: Math.round(carbGrams), format: "number", unit: "g/day" },
      { key: "fatGrams", label: "Fat", value: Math.round(fatGrams), format: "number", unit: "g/day" },
    ],
    notes: ["Protein and carbs provide 4 kcal/gram; fat provides 9 kcal/gram."],
  };
}

export const macroCalculator: CalculatorDef = {
  id: "macro",
  slug: "macro",
  title: "Macro Calculator",
  description: "Split a daily calorie target into grams of protein, carbohydrates, and fat.",
  category: "health",
  icon: PieChart,
  keywords: ["macros", "protein calculator", "carb calculator", "fat intake", "macronutrients"],
  inputs: [
    { name: "dailyCalories", label: "Daily calorie target", kind: "number", defaultValue: "2000", min: 500, max: 20000, step: 50, required: true },
    { name: "proteinPercent", label: "Protein (%)", kind: "percentage", defaultValue: "30", required: true },
    { name: "carbPercent", label: "Carbohydrates (%)", kind: "percentage", defaultValue: "40", required: true },
    { name: "fatPercent", label: "Fat (%)", kind: "percentage", defaultValue: "30", required: true },
  ],
  schema: macroSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Grams = (Daily calories × macro %) ÷ calories per gram (4 for protein/carbs, 9 for fat).",
  explanation: [
    {
      heading: "Common macro splits",
      body: "A balanced split is often around 30/40/30 (protein/carb/fat), while higher-protein or lower-carb approaches shift these percentages — there's no single correct ratio for everyone.",
    },
  ],
  faq: [
    { q: "Where do I get my daily calorie target?", a: "Use the Calorie Calculator to estimate your maintenance, cutting, or bulking calorie target first." },
  ],
  related: ["calorie", "lean-body-mass", "bmr"],
};
