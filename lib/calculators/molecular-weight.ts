import { Atom } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";

// Standard atomic weights (g/mol) for common elements.
const ATOMIC_WEIGHTS: Record<string, number> = {
  H: 1.008, He: 4.0026, Li: 6.94, Be: 9.0122, B: 10.81, C: 12.011, N: 14.007, O: 15.999, F: 18.998, Ne: 20.18,
  Na: 22.99, Mg: 24.305, Al: 26.982, Si: 28.085, P: 30.974, S: 32.06, Cl: 35.45, Ar: 39.948, K: 39.098, Ca: 40.078,
  Sc: 44.956, Ti: 47.867, V: 50.942, Cr: 51.996, Mn: 54.938, Fe: 55.845, Co: 58.933, Ni: 58.693, Cu: 63.546, Zn: 65.38,
  Ga: 69.723, Ge: 72.63, As: 74.922, Se: 78.971, Br: 79.904, Kr: 83.798, Rb: 85.468, Sr: 87.62, Y: 88.906, Zr: 91.224,
  Nb: 92.906, Mo: 95.95, Ag: 107.87, Cd: 112.41, In: 114.82, Sn: 118.71, Sb: 121.76, Te: 127.6, I: 126.9, Xe: 131.29,
  Cs: 132.91, Ba: 137.33, Pt: 195.08, Au: 196.97, Hg: 200.59, Pb: 207.2, Bi: 208.98, U: 238.03,
};

export const molecularWeightSchema = z.object({
  formula: z
    .string()
    .trim()
    .min(1, "Enter a chemical formula")
    .refine((v) => /^[A-Za-z0-9()]+$/.test(v), "Formula can only contain element symbols, numbers, and parentheses"),
});

export type MolecularWeightValues = z.infer<typeof molecularWeightSchema>;

/** Recursive-descent parser for chemical formulas like "Ca(OH)2" or "C6H12O6". */
function parseFormula(formula: string): Record<string, number> {
  let pos = 0;

  function parseCount(): number {
    const start = pos;
    while (pos < formula.length && /\d/.test(formula[pos])) pos++;
    return pos > start ? Number(formula.slice(start, pos)) : 1;
  }

  function parseGroup(): Record<string, number> {
    const counts: Record<string, number> = {};
    while (pos < formula.length && formula[pos] !== ")") {
      if (formula[pos] === "(") {
        pos++;
        const inner = parseGroup();
        if (formula[pos] !== ")") throw new Error("Unmatched parenthesis");
        pos++;
        const multiplier = parseCount();
        for (const [el, n] of Object.entries(inner)) counts[el] = (counts[el] ?? 0) + n * multiplier;
      } else if (/[A-Z]/.test(formula[pos])) {
        let symbol = formula[pos];
        pos++;
        if (pos < formula.length && /[a-z]/.test(formula[pos])) {
          symbol += formula[pos];
          pos++;
        }
        if (!(symbol in ATOMIC_WEIGHTS)) throw new Error(`Unknown element: ${symbol}`);
        const count = parseCount();
        counts[symbol] = (counts[symbol] ?? 0) + count;
      } else {
        throw new Error(`Unexpected character at position ${pos}`);
      }
    }
    return counts;
  }

  const result = parseGroup();
  if (pos !== formula.length) throw new Error("Unmatched parenthesis");
  return result;
}

function calculate(values: MolecularWeightValues): CalcResult {
  const counts = parseFormula(values.formula);
  let totalWeight = 0;
  const breakdown: string[] = [];

  for (const [element, count] of Object.entries(counts)) {
    const weight = ATOMIC_WEIGHTS[element] * count;
    totalWeight += weight;
    breakdown.push(`${element}${count > 1 ? count : ""}: ${Math.round(weight * 1000) / 1000}`);
  }

  return {
    primary: { key: "molecularWeight", label: "Molecular weight", value: Math.round(totalWeight * 1000) / 1000, format: "number", unit: "g/mol" },
    secondary: [{ key: "breakdown", label: "Element breakdown", value: breakdown.join(", "), format: "text" }],
  };
}

export const molecularWeightCalculator: CalculatorDef = {
  id: "molecular-weight",
  slug: "molecular-weight",
  title: "Molecular Weight Calculator",
  description: "Calculate the molecular weight of a chemical compound from its formula.",
  category: "other",
  icon: Atom,
  keywords: ["molecular weight", "molar mass", "molecular formula calculator"],
  inputs: [
    { name: "formula", label: "Chemical formula", kind: "text", defaultValue: "", required: true, placeholder: "e.g. H2O, C6H12O6, Ca(OH)2" },
  ],
  schema: molecularWeightSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Molecular weight = Σ (atomic weight of each element × its count in the formula), parsed directly from the chemical formula including parentheses.",
  explanation: [
    {
      heading: "Formula syntax",
      body: "Use standard chemical notation: element symbols with capital first letters (e.g. Na, Cl), numeric subscripts for counts, and parentheses for repeated groups (e.g. Ca(OH)2 for calcium hydroxide).",
    },
  ],
  faq: [
    { q: "Which elements are supported?", a: "This covers the most commonly used elements in general chemistry (through element 92, uranium) — let us know if you need a rarer one." },
  ],
  related: ["molarity"],
};
