import { describe, it, expect } from "vitest";
import { calorieCalculator, calorieSchema } from "./calorie";

function calc(input: Record<string, string>) {
  return calorieCalculator.calculate(calorieSchema.parse(input) as never);
}

describe("calorie calculator", () => {
  it("higher activity level yields higher maintenance calories", () => {
    const sedentary = calc({ unitSystem: "metric", gender: "male", age: "30", weight: "80", height: "180", activityLevel: "sedentary" });
    const active = calc({ unitSystem: "metric", gender: "male", age: "30", weight: "80", height: "180", activityLevel: "active" });
    expect(active.primary.value as number).toBeGreaterThan(sedentary.primary.value as number);
  });

  it("weight loss target is below maintenance", () => {
    const result = calc({ unitSystem: "metric", gender: "male", age: "30", weight: "80", height: "180", activityLevel: "moderate" });
    const loss = result.secondary.find((s) => s.key === "loss");
    expect(loss!.value as number).toBeLessThan(result.primary.value as number);
    expect(result.primary.value as number - (loss!.value as number)).toBeCloseTo(500, 0);
  });
});
