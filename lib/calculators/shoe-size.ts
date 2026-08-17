import { Footprints } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";

const GENDERS = ["men", "women"] as const;

export const shoeSizeSchema = z.object({
  gender: selectField(GENDERS, "Gender"),
  footLengthCm: numberField({ label: "Foot length (cm)", min: 10, max: 40 }),
});

export type ShoeSizeValues = z.infer<typeof shoeSizeSchema>;

function calculate(values: ShoeSizeValues): CalcResult {
  const { footLengthCm, gender } = values;
  // Approximate conversions based on standard sizing charts.
  const usSize = gender === "men" ? footLengthCm / 2.54 * 3 - 22 : footLengthCm / 2.54 * 3 - 21;
  const ukSize = usSize - (gender === "men" ? 0.5 : 1.5);
  const euSize = footLengthCm * 1.5 + 2;

  return {
    primary: { key: "usSize", label: `US size (${gender})`, value: Math.round(usSize * 2) / 2, format: "number" },
    secondary: [
      { key: "ukSize", label: `UK size (${gender})`, value: Math.round(ukSize * 2) / 2, format: "number" },
      { key: "euSize", label: "EU size", value: Math.round(euSize * 2) / 2, format: "number" },
    ],
    notes: ["Sizing varies by brand and shoe style — use this as a starting point and check the specific brand's size chart when possible."],
  };
}

export const shoeSizeCalculator: CalculatorDef = {
  id: "shoe-size",
  slug: "shoe-size",
  title: "Shoe Size Converter",
  description: "Convert foot length to US, UK, and EU shoe sizes.",
  category: "conversion",
  icon: Footprints,
  keywords: ["shoe size converter", "shoe size chart", "us uk eu shoe size"],
  inputs: [
    {
      name: "gender",
      label: "Gender",
      kind: "segmented",
      defaultValue: "men",
      options: [
        { value: "men", label: "Men's" },
        { value: "women", label: "Women's" },
      ],
    },
    { name: "footLengthCm", label: "Foot length (cm)", kind: "number", defaultValue: "", step: 0.1, required: true, helpText: "Measure from heel to the tip of the longest toe, standing." },
  ],
  schema: shoeSizeSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Approximated from standard US/UK/EU shoe sizing charts based on foot length in centimeters.",
  explanation: [
    {
      heading: "Measure both feet",
      body: "Most people have slightly different sized feet — measure both and size for the larger one for the best fit.",
    },
  ],
  faq: [
    { q: "Why do results vary between brands?", a: "Shoe sizing isn't perfectly standardized across manufacturers — this gives a reliable starting point, but always check a specific brand's chart if available." },
  ],
  related: ["unit-converter"],
};
