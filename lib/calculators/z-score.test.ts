import { describe, it, expect } from "vitest";
import { zScoreCalculator, zScoreSchema } from "./z-score";

function calc(input: Record<string, string>) {
  return zScoreCalculator.calculate(zScoreSchema.parse(input) as never);
}

describe("z-score calculator", () => {
  it("computes a z-score of 0 at the mean", () => {
    const result = calc({ value: "50", mean: "50", stdDev: "10" });
    expect(result.primary.value).toBe(0);
    const percentile = result.secondary.find((s) => s.key === "percentile");
    expect(percentile!.value as number).toBeCloseTo(50, 0);
  });

  it("computes a positive z-score above the mean", () => {
    const result = calc({ value: "70", mean: "50", stdDev: "10" });
    expect(result.primary.value).toBe(2);
    const percentile = result.secondary.find((s) => s.key === "percentile");
    expect(percentile!.value as number).toBeCloseTo(97.7, 0);
  });
});
