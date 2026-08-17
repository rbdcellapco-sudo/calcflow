import { describe, it, expect } from "vitest";
import { caloriesBurnedCalculator, caloriesBurnedSchema } from "./calories-burned";

function calc(input: Record<string, string>) {
  return caloriesBurnedCalculator.calculate(caloriesBurnedSchema.parse(input) as never);
}

describe("calories burned calculator", () => {
  it("computes calories burned for a 30 minute run", () => {
    const result = calc({ activity: "running", unitSystem: "metric", weight: "70", durationMinutes: "30" });
    // 9.8 * 70 * 0.5 = 343
    expect(result.primary.value).toBe(343);
  });

  it("longer duration burns more calories", () => {
    const short = calc({ activity: "walking", unitSystem: "metric", weight: "70", durationMinutes: "20" });
    const long = calc({ activity: "walking", unitSystem: "metric", weight: "70", durationMinutes: "60" });
    expect(long.primary.value as number).toBeGreaterThan(short.primary.value as number);
  });
});
