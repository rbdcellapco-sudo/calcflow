import { ClipboardCheck } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";

export const gradeSchema = z.object({
  score1: numberField({ label: "Score 1 (%)", min: 0, max: 100 }),
  weight1: numberField({ label: "Weight 1 (%)", min: 0, max: 100 }),
  score2: numberField({ label: "Score 2 (%)", min: 0, max: 100 }),
  weight2: numberField({ label: "Weight 2 (%)", min: 0, max: 100 }),
  score3: numberField({ label: "Score 3 (%)", min: 0, max: 100, required: false }),
  weight3: numberField({ label: "Weight 3 (%)", min: 0, max: 100, required: false }),
  score4: numberField({ label: "Score 4 (%)", min: 0, max: 100, required: false }),
  weight4: numberField({ label: "Weight 4 (%)", min: 0, max: 100, required: false }),
  score5: numberField({ label: "Score 5 (%)", min: 0, max: 100, required: false }),
  weight5: numberField({ label: "Weight 5 (%)", min: 0, max: 100, required: false }),
});

export type GradeValues = z.infer<typeof gradeSchema>;

function calculate(values: GradeValues): CalcResult {
  const items = [
    { score: values.score1, weight: values.weight1 },
    { score: values.score2, weight: values.weight2 },
    { score: values.score3, weight: values.weight3 },
    { score: values.score4, weight: values.weight4 },
    { score: values.score5, weight: values.weight5 },
  ].filter((i): i is { score: number; weight: number } => i.score !== undefined && i.weight !== undefined);

  const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);
  const weightedSum = items.reduce((sum, i) => sum + i.score * i.weight, 0);
  const finalGrade = totalWeight > 0 ? weightedSum / totalWeight : 0;

  let letter: string;
  if (finalGrade >= 90) letter = "A";
  else if (finalGrade >= 80) letter = "B";
  else if (finalGrade >= 70) letter = "C";
  else if (finalGrade >= 60) letter = "D";
  else letter = "F";

  return {
    primary: { key: "finalGrade", label: "Final grade", value: Math.round(finalGrade * 100) / 100, format: "percentage" },
    secondary: [
      { key: "letterGrade", label: "Approximate letter grade", value: letter, format: "text" },
      { key: "totalWeight", label: "Total weight used", value: totalWeight, format: "percentage" },
    ],
    notes: totalWeight !== 100 ? [`Weights sum to ${totalWeight}%, not 100% — the result is still a valid weighted average, but double-check your weights match your syllabus.`] : undefined,
  };
}

export const gradeCalculator: CalculatorDef = {
  id: "grade",
  slug: "grade",
  title: "Grade Calculator",
  description: "Calculate a weighted final grade from assignment, test, and exam scores.",
  category: "math",
  icon: ClipboardCheck,
  keywords: ["grade calculator", "weighted grade", "final grade", "course grade"],
  inputs: [
    { name: "score1", label: "Score 1 (%)", kind: "number", defaultValue: "", min: 0, max: 100, step: 0.1, required: true },
    { name: "weight1", label: "Weight 1 (%)", kind: "number", defaultValue: "", min: 0, max: 100, step: 0.1, required: true },
    { name: "score2", label: "Score 2 (%)", kind: "number", defaultValue: "", min: 0, max: 100, step: 0.1, required: true },
    { name: "weight2", label: "Weight 2 (%)", kind: "number", defaultValue: "", min: 0, max: 100, step: 0.1, required: true },
  ],
  advancedInputs: [
    { name: "score3", label: "Score 3 (%)", kind: "number", defaultValue: "", min: 0, max: 100, step: 0.1, required: false },
    { name: "weight3", label: "Weight 3 (%)", kind: "number", defaultValue: "", min: 0, max: 100, step: 0.1, required: false },
    { name: "score4", label: "Score 4 (%)", kind: "number", defaultValue: "", min: 0, max: 100, step: 0.1, required: false },
    { name: "weight4", label: "Weight 4 (%)", kind: "number", defaultValue: "", min: 0, max: 100, step: 0.1, required: false },
    { name: "score5", label: "Score 5 (%)", kind: "number", defaultValue: "", min: 0, max: 100, step: 0.1, required: false },
    { name: "weight5", label: "Weight 5 (%)", kind: "number", defaultValue: "", min: 0, max: 100, step: 0.1, required: false },
  ],
  schema: gradeSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Final grade = Σ(score × weight) ÷ Σ(weight).",
  explanation: [
    {
      heading: "Weights should sum to 100%",
      body: "If your weights don't add up to 100%, the calculator still computes a valid weighted average, but check your syllabus — you may be missing a category.",
    },
  ],
  faq: [
    { q: "What if I have more than 5 grade categories?", a: "Combine categories with similar weights first, or calculate in batches and combine using total weighted points." },
  ],
  related: ["gpa"],
};
