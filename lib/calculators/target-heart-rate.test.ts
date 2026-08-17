import { describe, it, expect } from "vitest";
import { targetHeartRateCalculator, targetHeartRateSchema } from "./target-heart-rate";

function calc(input: Record<string, string>) {
  return targetHeartRateCalculator.calculate(targetHeartRateSchema.parse(input) as never);
}

describe("target heart rate calculator", () => {
  it("computes max heart rate as 220 minus age", () => {
    const result = calc({ age: "30" });
    expect(result.primary.value).toBe(190);
  });

  it("uses the Karvonen method when resting heart rate is provided", () => {
    const withResting = calc({ age: "30", restingHeartRate: "60" });
    expect(withResting.notes?.[0]).toMatch(/karvonen/i);
  });
});
