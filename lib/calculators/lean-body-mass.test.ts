import { describe, it, expect } from "vitest";
import { leanBodyMassCalculator, leanBodyMassSchema } from "./lean-body-mass";

function calc(input: Record<string, string>) {
  return leanBodyMassCalculator.calculate(leanBodyMassSchema.parse(input) as never);
}

describe("lean body mass calculator", () => {
  it("computes lean body mass less than total weight", () => {
    const result = calc({ unitSystem: "metric", gender: "male", weight: "80", height: "180" });
    expect(result.primary.value as number).toBeLessThan(80);
    expect(result.primary.value as number).toBeGreaterThan(0);
  });

  it("fat mass plus lean mass approximately equals total weight", () => {
    const result = calc({ unitSystem: "metric", gender: "female", weight: "65", height: "165" });
    const fatMass = result.secondary.find((s) => s.key === "fatMass")!.value as number;
    expect((result.primary.value as number) + fatMass).toBeCloseTo(65, 0);
  });
});
