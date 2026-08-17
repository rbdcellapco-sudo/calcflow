import { Grid2x2 } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef, ResultValue } from "../types";
import { numberField } from "../validation";
import { ceilSafe } from "../format";

export const tileSchema = z.object({
  roomLength: numberField({ label: "Room length (ft)", min: 0.1, max: 10000 }),
  roomWidth: numberField({ label: "Room width (ft)", min: 0.1, max: 10000 }),
  tileLengthIn: numberField({ label: "Tile length (in)", min: 0.1, max: 1000 }),
  tileWidthIn: numberField({ label: "Tile width (in)", min: 0.1, max: 1000 }),
  wastePercent: numberField({ label: "Waste allowance", min: 0, max: 50, required: false }),
  tilesPerBox: numberField({ label: "Tiles per box", min: 1, max: 1000, required: false }),
});

export type TileValues = z.infer<typeof tileSchema>;

function calculate(values: TileValues): CalcResult {
  const roomSqFt = values.roomLength * values.roomWidth;
  const tileSqFt = (values.tileLengthIn * values.tileWidthIn) / 144;
  const waste = (values.wastePercent ?? 10) / 100;

  const tilesNeededExact = roomSqFt / tileSqFt;
  const tilesWithWaste = ceilSafe(tilesNeededExact * (1 + waste));

  const secondary: ResultValue[] = [
    { key: "roomSqFt", label: "Room area", value: Math.round(roomSqFt * 100) / 100, format: "number", unit: "sq ft" },
    { key: "tileSqFt", label: "Area per tile", value: Math.round(tileSqFt * 1000) / 1000, format: "number", unit: "sq ft" },
  ];

  if (values.tilesPerBox) {
    const boxesNeeded = ceilSafe(tilesWithWaste / values.tilesPerBox);
    secondary.push({ key: "boxesNeeded", label: "Boxes needed", value: boxesNeeded, format: "number" });
  }

  return {
    primary: { key: "tilesNeeded", label: "Tiles needed (with waste)", value: tilesWithWaste, format: "number" },
    secondary,
  };
}

export const tileCalculator: CalculatorDef = {
  id: "tile",
  slug: "tile",
  title: "Tile Calculator",
  description: "Calculate how many tiles (and boxes) you need for a room, including waste.",
  category: "other",
  icon: Grid2x2,
  keywords: ["tile calculator", "flooring tiles", "how many tiles"],
  inputs: [
    { name: "roomLength", label: "Room length (ft)", kind: "number", defaultValue: "", step: 0.1, required: true },
    { name: "roomWidth", label: "Room width (ft)", kind: "number", defaultValue: "", step: 0.1, required: true },
    { name: "tileLengthIn", label: "Tile length (in)", kind: "number", defaultValue: "12", step: 0.1, required: true },
    { name: "tileWidthIn", label: "Tile width (in)", kind: "number", defaultValue: "12", step: 0.1, required: true },
  ],
  advancedInputs: [
    { name: "wastePercent", label: "Waste allowance (%)", kind: "percentage", defaultValue: "10", required: false, helpText: "Accounts for cuts, breakage, and pattern matching." },
    { name: "tilesPerBox", label: "Tiles per box (optional)", kind: "number", defaultValue: "", min: 1, step: 1, required: false },
  ],
  schema: tileSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Tiles needed = (Room area ÷ Tile area) × (1 + waste allowance), rounded up.",
  explanation: [
    {
      heading: "Why the waste allowance matters",
      body: "A 10% waste allowance is typical for straight layouts, but diagonal patterns, complex room shapes, or first-time DIY installs often warrant 15-20%.",
    },
  ],
  faq: [
    { q: "Should grout lines change the calculation?", a: "For most rooms, grout line width has a negligible effect on tile count — the waste allowance comfortably covers it." },
  ],
  related: ["square-footage", "area"],
};
