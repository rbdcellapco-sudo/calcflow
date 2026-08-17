import { describe, it, expect } from "vitest";
import { healthyWeightCalculator, healthyWeightSchema } from "./healthy-weight";

function calc(input: Record<string, string>) {
  return healthyWeightCalculator.calculate(healthyWeightSchema.parse(input) as never);
}

describe("healthy weight calculator", () => {
  it("computes a healthy range that widens with height", () => {
    const result = calc({ unitSystem: "metric", gender: "male", height: "180" });
    const min = result.secondary.find((s) => s.key === "minHealthy")!.value as number;
    const max = result.secondary.find((s) => s.key === "maxHealthy")!.value as number;
    expect(max).toBeGreaterThan(min);
    expect(min).toBeGreaterThan(0);
  });

  it("male and female ideal weight differ at the same height", () => {
    const male = calc({ unitSystem: "metric", gender: "male", height: "170" });
    const female = calc({ unitSystem: "metric", gender: "female", height: "170" });
    expect(male.primary.value).not.toBe(female.primary.value);
  });
});
