import { FlaskConical } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";

const SOLVE_FOR = ["molarity", "moles", "volume"] as const;

export const molaritySchema = z.object({
  solveFor: selectField(SOLVE_FOR, "Solve for"),
  moles: numberField({ label: "Moles (mol)", min: 0, required: false }),
  volumeLiters: numberField({ label: "Volume (L)", min: 0, required: false }),
  molarity: numberField({ label: "Molarity (mol/L)", min: 0, required: false }),
});

export type MolarityValues = z.infer<typeof molaritySchema>;

function calculate(values: MolarityValues): CalcResult {
  const { solveFor, moles, volumeLiters, molarity } = values;

  if (solveFor === "molarity") {
    if (moles === undefined || volumeLiters === undefined) throw new Error("Enter moles and volume");
    if (volumeLiters === 0) throw new Error("Volume can't be zero");
    return { primary: { key: "molarity", label: "Molarity", value: Math.round((moles / volumeLiters) * 1000) / 1000, format: "number", unit: "mol/L" }, secondary: [] };
  }

  if (solveFor === "moles") {
    if (molarity === undefined || volumeLiters === undefined) throw new Error("Enter molarity and volume");
    return { primary: { key: "moles", label: "Moles", value: Math.round(molarity * volumeLiters * 1000) / 1000, format: "number", unit: "mol" }, secondary: [] };
  }

  if (moles === undefined || molarity === undefined) throw new Error("Enter moles and molarity");
  if (molarity === 0) throw new Error("Molarity can't be zero");
  return { primary: { key: "volume", label: "Volume", value: Math.round((moles / molarity) * 1000) / 1000, format: "number", unit: "L" }, secondary: [] };
}

export const molarityCalculator: CalculatorDef = {
  id: "molarity",
  slug: "molarity",
  title: "Molarity Calculator",
  description: "Solve for molarity, moles, or volume of a solution.",
  category: "other",
  icon: FlaskConical,
  keywords: ["molarity calculator", "molar concentration", "moles volume", "chemistry"],
  inputs: [
    {
      name: "solveFor",
      label: "Solve for",
      kind: "segmented",
      defaultValue: "molarity",
      options: [
        { value: "molarity", label: "Molarity" },
        { value: "moles", label: "Moles" },
        { value: "volume", label: "Volume" },
      ],
    },
    { name: "moles", label: "Moles (mol)", kind: "number", defaultValue: "", step: 0.0001, required: false },
    { name: "volumeLiters", label: "Volume (L)", kind: "number", defaultValue: "", step: 0.0001, required: false },
    { name: "molarity", label: "Molarity (mol/L)", kind: "number", defaultValue: "", step: 0.0001, required: false },
  ],
  schema: molaritySchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Molarity (M) = Moles of solute ÷ Liters of solution.",
  explanation: [
    {
      heading: "Solution volume, not solvent volume",
      body: "Molarity uses the total volume of the final solution, not just the volume of solvent added — this matters because dissolving a solute can change the total volume slightly.",
    },
  ],
  faq: [
    { q: "How do I get moles from grams?", a: "Use the Molecular Weight Calculator to find a compound's molar mass, then divide grams by molar mass to get moles." },
  ],
  related: ["molecular-weight", "density"],
};
