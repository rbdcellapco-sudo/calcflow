import { Triangle as TriangleIcon } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";

const MODES = ["sss", "sas", "asa"] as const;

export const triangleSchema = z.object({
  mode: selectField(MODES, "Known values"),
  a: numberField({ label: "Side a", min: 0.0001, max: 1_000_000 }),
  b: numberField({ label: "Side b / Angle B", min: 0.0001, max: 1_000_000 }),
  c: numberField({ label: "Side c / Angle C", min: 0.0001, max: 1_000_000 }),
});

export type TriangleValues = z.infer<typeof triangleSchema>;

const toDeg = (rad: number) => (rad * 180) / Math.PI;
const toRad = (deg: number) => (deg * Math.PI) / 180;

function calculate(values: TriangleValues): CalcResult {
  const { mode, a, b, c } = values;
  let sideA: number, sideB: number, sideC: number, angleA: number, angleB: number, angleC: number;

  if (mode === "sss") {
    sideA = a; sideB = b; sideC = c;
    if (sideA + sideB <= sideC || sideA + sideC <= sideB || sideB + sideC <= sideA) {
      throw new Error("These three sides can't form a triangle");
    }
    angleA = toDeg(Math.acos((sideB ** 2 + sideC ** 2 - sideA ** 2) / (2 * sideB * sideC)));
    angleB = toDeg(Math.acos((sideA ** 2 + sideC ** 2 - sideB ** 2) / (2 * sideA * sideC)));
    angleC = 180 - angleA - angleB;
  } else if (mode === "sas") {
    // a = side, b = included angle (degrees), c = other side
    sideA = a; sideC = c;
    angleB = b;
    sideB = Math.sqrt(sideA ** 2 + sideC ** 2 - 2 * sideA * sideC * Math.cos(toRad(angleB)));
    angleA = toDeg(Math.asin((sideA * Math.sin(toRad(angleB))) / sideB));
    angleC = 180 - angleA - angleB;
  } else {
    // asa: a = angle A, b = side between, c = angle C
    angleA = a; angleC = c;
    angleB = 180 - angleA - angleC;
    if (angleB <= 0) throw new Error("Angles must sum to less than 180°");
    sideB = b;
    sideA = (sideB * Math.sin(toRad(angleA))) / Math.sin(toRad(angleB));
    sideC = (sideB * Math.sin(toRad(angleC))) / Math.sin(toRad(angleB));
  }

  const s = (sideA + sideB + sideC) / 2;
  const area = Math.sqrt(s * (s - sideA) * (s - sideB) * (s - sideC));
  const perimeter = sideA + sideB + sideC;

  return {
    primary: { key: "area", label: "Area", value: Math.round(area * 1000) / 1000, format: "number" },
    secondary: [
      { key: "perimeter", label: "Perimeter", value: Math.round(perimeter * 1000) / 1000, format: "number" },
      { key: "angleA", label: "Angle A", value: Math.round(angleA * 100) / 100, format: "number", unit: "°" },
      { key: "angleB", label: "Angle B", value: Math.round(angleB * 100) / 100, format: "number", unit: "°" },
      { key: "angleC", label: "Angle C", value: Math.round(angleC * 100) / 100, format: "number", unit: "°" },
      { key: "sideA", label: "Side a", value: Math.round(sideA * 1000) / 1000, format: "number" },
      { key: "sideB", label: "Side b", value: Math.round(sideB * 1000) / 1000, format: "number" },
      { key: "sideC", label: "Side c", value: Math.round(sideC * 1000) / 1000, format: "number" },
    ],
  };
}

export const triangleCalculator: CalculatorDef = {
  id: "triangle",
  slug: "triangle",
  title: "Triangle Calculator",
  description: "Solve any triangle for all sides, angles, and area from three known values.",
  category: "math",
  icon: TriangleIcon,
  keywords: ["triangle solver", "law of cosines", "law of sines", "sss", "sas", "asa"],
  inputs: [
    {
      name: "mode",
      label: "Known values",
      kind: "segmented",
      defaultValue: "sss",
      options: [
        { value: "sss", label: "3 sides (SSS)" },
        { value: "sas", label: "2 sides + angle (SAS)" },
        { value: "asa", label: "2 angles + side (ASA)" },
      ],
    },
    { name: "a", label: "Side a", kind: "number", defaultValue: "", step: 0.01, required: true },
    { name: "b", label: "Side b", kind: "number", defaultValue: "", step: 0.01, required: true },
    { name: "c", label: "Side c", kind: "number", defaultValue: "", step: 0.01, required: true },
  ],
  schema: triangleSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  dynamicLabels: (values) => {
    if (values.mode === "sas") return { a: "Side a", b: "Included angle B (°)", c: "Side c" };
    if (values.mode === "asa") return { a: "Angle A (°)", b: "Side b (between angles)", c: "Angle C (°)" };
    return { a: "Side a", b: "Side b", c: "Side c" };
  },
  formula: "Law of cosines: c² = a² + b² − 2ab·cos(C). Law of sines: a/sin(A) = b/sin(B) = c/sin(C). Area (Heron's formula): √(s(s−a)(s−b)(s−c)).",
  explanation: [
    {
      heading: "Choose the right mode for what you know",
      body: "SSS is for three known side lengths, SAS for two sides and the angle between them, and ASA for two angles and the side between them — pick whichever matches your known measurements.",
    },
  ],
  faq: [
    { q: "What if my three sides can't form a triangle?", a: "The triangle inequality requires any two sides to sum to more than the third — if that's not the case, no valid triangle exists." },
  ],
  related: ["right-triangle", "area", "distance"],
};
