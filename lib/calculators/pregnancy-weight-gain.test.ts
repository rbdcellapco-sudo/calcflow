import { describe, it, expect } from "vitest";
import { pregnancyWeightGainCalculator, pregnancyWeightGainSchema } from "./pregnancy-weight-gain";

function calc(input: Record<string, string>) {
  return pregnancyWeightGainCalculator.calculate(pregnancyWeightGainSchema.parse(input) as never);
}

describe("pregnancy weight gain calculator", () => {
  it("recommends a lower total range for a higher pre-pregnancy BMI", () => {
    const normal = calc({ unitSystem: "metric", prePregnancyWeight: "60", height: "165", currentWeek: "20" });
    const obese = calc({ unitSystem: "metric", prePregnancyWeight: "95", height: "165", currentWeek: "20" });
    const normalCategory = normal.secondary.find((s) => s.key === "category")!.value;
    const obeseCategory = obese.secondary.find((s) => s.key === "category")!.value;
    expect(normalCategory).toBe("Normal");
    expect(obeseCategory).toBe("Obese");
  });

  it("estimated gain increases with pregnancy week", () => {
    const early = calc({ unitSystem: "metric", prePregnancyWeight: "60", height: "165", currentWeek: "15" });
    const late = calc({ unitSystem: "metric", prePregnancyWeight: "60", height: "165", currentWeek: "35" });
    const earlyGain = early.secondary.find((s) => s.key === "estimatedGainSoFar")!.value as number;
    const lateGain = late.secondary.find((s) => s.key === "estimatedGainSoFar")!.value as number;
    expect(lateGain).toBeGreaterThan(earlyGain);
  });
});
