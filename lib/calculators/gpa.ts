import { GraduationCap } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";

const GRADES = ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F"] as const;
const GRADE_POINTS: Record<(typeof GRADES)[number], number> = {
  A: 4.0, "A-": 3.7, "B+": 3.3, B: 3.0, "B-": 2.7, "C+": 2.3, C: 2.0, "C-": 1.7, "D+": 1.3, D: 1.0, F: 0.0,
};

function optionalGradeField() {
  return z
    .string()
    .optional()
    .transform((v) => (v && (GRADES as readonly string[]).includes(v) ? (v as (typeof GRADES)[number]) : undefined));
}

export const gpaSchema = z.object({
  grade1: selectField(GRADES, "Grade 1"),
  credits1: numberField({ label: "Credits 1", min: 0.5, max: 10 }),
  grade2: selectField(GRADES, "Grade 2"),
  credits2: numberField({ label: "Credits 2", min: 0.5, max: 10 }),
  grade3: optionalGradeField(),
  credits3: numberField({ label: "Credits 3", min: 0.5, max: 10, required: false }),
  grade4: optionalGradeField(),
  credits4: numberField({ label: "Credits 4", min: 0.5, max: 10, required: false }),
  grade5: optionalGradeField(),
  credits5: numberField({ label: "Credits 5", min: 0.5, max: 10, required: false }),
});

export type GpaValues = z.infer<typeof gpaSchema>;

function calculate(values: GpaValues): CalcResult {
  const courses: { grade?: (typeof GRADES)[number]; credits?: number }[] = [
    { grade: values.grade1, credits: values.credits1 },
    { grade: values.grade2, credits: values.credits2 },
    { grade: values.grade3, credits: values.credits3 },
    { grade: values.grade4, credits: values.credits4 },
    { grade: values.grade5, credits: values.credits5 },
  ].filter((c) => c.grade && c.credits);

  let totalPoints = 0;
  let totalCredits = 0;
  for (const c of courses) {
    totalPoints += GRADE_POINTS[c.grade!] * c.credits!;
    totalCredits += c.credits!;
  }
  const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

  return {
    primary: { key: "gpa", label: "GPA", value: Math.round(gpa * 1000) / 1000, format: "number" },
    secondary: [
      { key: "totalCredits", label: "Total credits", value: totalCredits, format: "number" },
      { key: "totalPoints", label: "Total grade points", value: Math.round(totalPoints * 100) / 100, format: "number" },
    ],
  };
}

export const gpaCalculator: CalculatorDef = {
  id: "gpa",
  slug: "gpa",
  title: "GPA Calculator",
  description: "Calculate your grade point average from course grades and credit hours.",
  category: "math",
  icon: GraduationCap,
  keywords: ["gpa", "grade point average", "college gpa", "semester gpa"],
  inputs: [
    {
      name: "grade1", label: "Grade 1", kind: "select", defaultValue: "A",
      options: GRADES.map((g) => ({ value: g, label: g })),
    },
    { name: "credits1", label: "Credits 1", kind: "number", defaultValue: "3", min: 0.5, max: 10, step: 0.5, required: true },
    {
      name: "grade2", label: "Grade 2", kind: "select", defaultValue: "A",
      options: GRADES.map((g) => ({ value: g, label: g })),
    },
    { name: "credits2", label: "Credits 2", kind: "number", defaultValue: "3", min: 0.5, max: 10, step: 0.5, required: true },
  ],
  advancedInputs: [
    { name: "grade3", label: "Grade 3", kind: "select", defaultValue: "", options: [{ value: "", label: "(unused)" }, ...GRADES.map((g) => ({ value: g, label: g }))], required: false },
    { name: "credits3", label: "Credits 3", kind: "number", defaultValue: "", min: 0.5, max: 10, step: 0.5, required: false },
    { name: "grade4", label: "Grade 4", kind: "select", defaultValue: "", options: [{ value: "", label: "(unused)" }, ...GRADES.map((g) => ({ value: g, label: g }))], required: false },
    { name: "credits4", label: "Credits 4", kind: "number", defaultValue: "", min: 0.5, max: 10, step: 0.5, required: false },
    { name: "grade5", label: "Grade 5", kind: "select", defaultValue: "", options: [{ value: "", label: "(unused)" }, ...GRADES.map((g) => ({ value: g, label: g }))], required: false },
    { name: "credits5", label: "Credits 5", kind: "number", defaultValue: "", min: 0.5, max: 10, step: 0.5, required: false },
  ],
  schema: gpaSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "GPA = Σ(grade points × credit hours) ÷ Σ(credit hours), on a standard 4.0 scale.",
  explanation: [
    {
      heading: "Standard 4.0 scale",
      body: "This uses the common US 4.0 scale with +/- modifiers. Some schools use different scales or don't use +/- grades — check your institution's specific scale if it differs.",
    },
  ],
  faq: [
    { q: "What if I have more than 5 courses?", a: "Calculate in two batches and combine using the total credits and total grade points from each." },
  ],
  related: ["grade", "average-return"],
};
