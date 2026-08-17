import { describe, it, expect } from "vitest";
import { tireSizeCalculator, tireSizeSchema } from "./tire-size";

function calc(input: Record<string, string>) {
  return tireSizeCalculator.calculate(tireSizeSchema.parse(input) as never);
}

describe("tire size calculator", () => {
  it("computes a plausible overall diameter for 225/45R17", () => {
    const result = calc({ width: "225", aspectRatio: "45", wheelDiameter: "17" });
    // sidewall = 225*0.45=101.25mm each side *2=202.5mm + 17*25.4=431.8mm = 634.3mm = 24.97in
    expect(result.primary.value as number).toBeCloseTo(24.97, 1);
  });

  it("a larger wheel diameter increases overall diameter", () => {
    const small = calc({ width: "225", aspectRatio: "45", wheelDiameter: "16" });
    const large = calc({ width: "225", aspectRatio: "45", wheelDiameter: "18" });
    expect(large.primary.value as number).toBeGreaterThan(small.primary.value as number);
  });
});
