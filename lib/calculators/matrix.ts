import { Grid3x3 } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";

const OPERATIONS = ["add", "subtract", "multiply", "determinant", "transpose"] as const;

export const matrixSchema = z.object({
  operation: selectField(OPERATIONS, "Operation"),
  a11: numberField({ label: "A[1,1]" }),
  a12: numberField({ label: "A[1,2]" }),
  a21: numberField({ label: "A[2,1]" }),
  a22: numberField({ label: "A[2,2]" }),
  b11: numberField({ label: "B[1,1]", required: false }),
  b12: numberField({ label: "B[1,2]", required: false }),
  b21: numberField({ label: "B[2,1]", required: false }),
  b22: numberField({ label: "B[2,2]", required: false }),
});

export type MatrixValues = z.infer<typeof matrixSchema>;

function formatMatrix(m: number[][]): string {
  return `[${m[0].join(", ")}] / [${m[1].join(", ")}]`;
}

function calculate(values: MatrixValues): CalcResult {
  const A = [[values.a11, values.a12], [values.a21, values.a22]];

  if (values.operation === "determinant") {
    const det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
    return { primary: { key: "determinant", label: "Determinant of A", value: det, format: "number" }, secondary: [] };
  }

  if (values.operation === "transpose") {
    const T = [[A[0][0], A[1][0]], [A[0][1], A[1][1]]];
    return { primary: { key: "transpose", label: "Transpose of A", value: formatMatrix(T), format: "text" }, secondary: [] };
  }

  const B = [
    [values.b11 ?? 0, values.b12 ?? 0],
    [values.b21 ?? 0, values.b22 ?? 0],
  ];

  let C: number[][];
  if (values.operation === "add") {
    C = [[A[0][0] + B[0][0], A[0][1] + B[0][1]], [A[1][0] + B[1][0], A[1][1] + B[1][1]]];
  } else if (values.operation === "subtract") {
    C = [[A[0][0] - B[0][0], A[0][1] - B[0][1]], [A[1][0] - B[1][0], A[1][1] - B[1][1]]];
  } else {
    C = [
      [A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
      [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]],
    ];
  }

  return {
    primary: { key: "result", label: "Result matrix", value: formatMatrix(C), format: "text" },
    secondary: [],
  };
}

export const matrixCalculator: CalculatorDef = {
  id: "matrix",
  slug: "matrix",
  title: "2×2 Matrix Calculator",
  description: "Add, subtract, multiply, transpose, or find the determinant of 2×2 matrices.",
  category: "math",
  icon: Grid3x3,
  keywords: ["matrix calculator", "matrix multiplication", "determinant", "transpose"],
  inputs: [
    {
      name: "operation",
      label: "Operation",
      kind: "select",
      defaultValue: "multiply",
      options: [
        { value: "add", label: "A + B" },
        { value: "subtract", label: "A − B" },
        { value: "multiply", label: "A × B" },
        { value: "determinant", label: "Determinant of A" },
        { value: "transpose", label: "Transpose of A" },
      ],
    },
    { name: "a11", label: "A[1,1]", kind: "number", defaultValue: "1", step: 0.01, required: true },
    { name: "a12", label: "A[1,2]", kind: "number", defaultValue: "0", step: 0.01, required: true },
    { name: "a21", label: "A[2,1]", kind: "number", defaultValue: "0", step: 0.01, required: true },
    { name: "a22", label: "A[2,2]", kind: "number", defaultValue: "1", step: 0.01, required: true },
  ],
  advancedInputs: [
    { name: "b11", label: "B[1,1]", kind: "number", defaultValue: "1", step: 0.01, required: false },
    { name: "b12", label: "B[1,2]", kind: "number", defaultValue: "0", step: 0.01, required: false },
    { name: "b21", label: "B[2,1]", kind: "number", defaultValue: "0", step: 0.01, required: false },
    { name: "b22", label: "B[2,2]", kind: "number", defaultValue: "1", step: 0.01, required: false },
  ],
  schema: matrixSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Determinant: det(A) = a₁₁a₂₂ − a₁₂a₂₁. Multiplication follows standard row-by-column matrix multiplication.",
  explanation: [
    {
      heading: "Fixed at 2×2",
      body: "This calculator handles 2×2 matrices, the most common size for introductory linear algebra. Matrix B is only used for add, subtract, and multiply.",
    },
  ],
  faq: [
    { q: "What does a determinant of 0 mean?", a: "It means the matrix is singular (non-invertible) — it collapses space into a lower dimension rather than a full linear transformation." },
  ],
  related: ["big-number"],
};
