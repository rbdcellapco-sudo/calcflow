import { Ruler } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";

const UNIT_SYSTEMS = ["in", "cm"] as const;
const CUP_LETTERS = ["AA", "A", "B", "C", "D", "DD/E", "DDD/F", "G", "H"];

export const braSizeSchema = z.object({
  unitSystem: selectField(UNIT_SYSTEMS, "Unit"),
  bandMeasurement: numberField({ label: "Band measurement (under bust)", min: 10, max: 200 }),
  bustMeasurement: numberField({ label: "Bust measurement (fullest point)", min: 10, max: 200 }),
});

export type BraSizeValues = z.infer<typeof braSizeSchema>;

function calculate(values: BraSizeValues): CalcResult {
  const toInches = (v: number) => (values.unitSystem === "in" ? v : v / 2.54);
  const bandIn = toInches(values.bandMeasurement);
  const bustIn = toInches(values.bustMeasurement);

  // Round band to nearest even number, per standard sizing convention.
  let bandSize = Math.round(bandIn / 2) * 2;
  if (bandSize % 2 !== 0) bandSize += 1;

  const difference = Math.round(bustIn - bandIn);
  const cupIndex = Math.max(0, Math.min(CUP_LETTERS.length - 1, difference));
  const cupLetter = CUP_LETTERS[cupIndex];

  return {
    primary: { key: "size", label: "Estimated bra size", value: `${bandSize}${cupLetter}`, format: "text" },
    secondary: [{ key: "difference", label: "Bust-band difference (in)", value: difference, format: "number" }],
    notes: ["Sizing conventions vary between brands and countries — use this as a starting point and try adjacent sizes when trying on."],
  };
}

export const braSizeCalculator: CalculatorDef = {
  id: "bra-size",
  slug: "bra-size",
  title: "Bra Size Calculator",
  description: "Estimate your bra size from band and bust measurements.",
  category: "other",
  icon: Ruler,
  keywords: ["bra size calculator", "band size", "cup size"],
  inputs: [
    {
      name: "unitSystem",
      label: "Unit",
      kind: "segmented",
      defaultValue: "in",
      options: [
        { value: "in", label: "Inches" },
        { value: "cm", label: "Centimeters" },
      ],
    },
    { name: "bandMeasurement", label: "Band measurement (under bust)", kind: "number", defaultValue: "", step: 0.1, required: true },
    { name: "bustMeasurement", label: "Bust measurement (fullest point)", kind: "number", defaultValue: "", step: 0.1, required: true },
  ],
  schema: braSizeSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Band size rounds to the nearest even number. Cup size is determined by the difference between bust and band measurements (each inch of difference is roughly one cup size).",
  explanation: [
    {
      heading: "Measuring correctly",
      body: "Measure the band snugly around your ribcage, just under the bust, and the bust measurement around the fullest part — both while wearing a non-padded bra for the most accurate result.",
    },
  ],
  faq: [
    { q: "Why did my measured size not match what I usually wear?", a: "Bra sizing isn't fully standardized across brands, and body shape affects fit beyond these two measurements — treat this as a useful starting point for trying on sizes." },
  ],
  related: ["shoe-size"],
};
