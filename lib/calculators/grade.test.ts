import { describe, it, expect } from "vitest";
import { gradeCalculator, gradeSchema } from "./grade";

function calc(input: Record<string, string>) {
  return gradeCalculator.calculate(gradeSchema.parse(input) as never);
}

describe("grade calculator", () => {
  it("computes a weighted final grade", () => {
    const result = calc({ score1: "90", weight1: "60", score2: "80", weight2: "40" });
    // (90*60+80*40)/100 = 86
    expect(result.primary.value).toBe(86);
  });

  it("notes when weights don't sum to 100", () => {
    const result = calc({ score1: "90", weight1: "50", score2: "80", weight2: "30" });
    expect(result.notes).toBeDefined();
  });
});
