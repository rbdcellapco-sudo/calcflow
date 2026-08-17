import { describe, it, expect } from "vitest";
import { pValueCalculator, pValueSchema } from "./p-value";

function calc(input: Record<string, string>) {
  return pValueCalculator.calculate(pValueSchema.parse(input) as never);
}

describe("p-value calculator", () => {
  it("computes a small two-tailed p-value for a large z-score", () => {
    const result = calc({ zScore: "2.5", tailType: "two-tailed" });
    expect(result.primary.value as number).toBeCloseTo(0.0124, 3);
  });

  it("two-tailed p-value is double the one-tailed value", () => {
    const twoTailed = calc({ zScore: "1.96", tailType: "two-tailed" });
    const rightTailed = calc({ zScore: "1.96", tailType: "right-tailed" });
    expect(twoTailed.primary.value as number).toBeCloseTo((rightTailed.primary.value as number) * 2, 2);
  });
});
