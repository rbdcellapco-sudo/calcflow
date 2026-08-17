import { describe, it, expect } from "vitest";
import { molecularWeightCalculator, molecularWeightSchema } from "./molecular-weight";

function calc(input: Record<string, string>) {
  return molecularWeightCalculator.calculate(molecularWeightSchema.parse(input) as never);
}

describe("molecular weight calculator", () => {
  it("computes the molecular weight of water", () => {
    const result = calc({ formula: "H2O" });
    // 2*1.008 + 15.999 = 18.015
    expect(result.primary.value as number).toBeCloseTo(18.015, 2);
  });

  it("computes the molecular weight of glucose", () => {
    const result = calc({ formula: "C6H12O6" });
    // 6*12.011 + 12*1.008 + 6*15.999 = 180.156
    expect(result.primary.value as number).toBeCloseTo(180.156, 1);
  });

  it("handles parentheses, e.g. calcium hydroxide", () => {
    const result = calc({ formula: "Ca(OH)2" });
    // 40.078 + 2*(15.999+1.008) = 74.092
    expect(result.primary.value as number).toBeCloseTo(74.092, 1);
  });

  it("rejects an unknown element", () => {
    expect(() => molecularWeightCalculator.calculate(molecularWeightSchema.parse({ formula: "Xx2" }) as never)).toThrow();
  });
});
