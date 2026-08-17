import { describe, it, expect } from "vitest";
import { bmrCalculator, bmrSchema } from "./bmr";

function calc(input: Record<string, string>) {
  return bmrCalculator.calculate(bmrSchema.parse(input) as never);
}

describe("bmr calculator", () => {
  it("computes male BMR via Mifflin-St Jeor", () => {
    const result = calc({ unitSystem: "metric", gender: "male", age: "30", weight: "80", height: "180" });
    // 10*80+6.25*180-5*30+5 = 800+1125-150+5=1780
    expect(result.primary.value).toBe(1780);
  });

  it("computes female BMR via Mifflin-St Jeor", () => {
    const result = calc({ unitSystem: "metric", gender: "female", age: "30", weight: "65", height: "165" });
    // 10*65+6.25*165-5*30-161 = 650+1031.25-150-161=1370.25 -> rounds to 1370
    expect(result.primary.value).toBe(1370);
  });

  it("converts imperial units", () => {
    const metric = calc({ unitSystem: "metric", gender: "male", age: "30", weight: "80", height: "180" });
    const imperial = calc({ unitSystem: "imperial", gender: "male", age: "30", weight: "176.37", height: "70.87" });
    expect(imperial.primary.value as number).toBeCloseTo(metric.primary.value as number, -1);
  });
});
