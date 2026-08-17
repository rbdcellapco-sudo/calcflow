import { describe, it, expect } from "vitest";
import { macroCalculator, macroSchema } from "./macro";

function calc(input: Record<string, string>) {
  return macroCalculator.calculate(macroSchema.parse(input) as never);
}

describe("macro calculator", () => {
  it("computes grams for a 2000 calorie 30/40/30 split", () => {
    const result = calc({ dailyCalories: "2000", proteinPercent: "30", carbPercent: "40", fatPercent: "30" });
    // protein: 600kcal/4=150g
    expect(result.primary.value).toBe(150);
    const carb = result.secondary.find((s) => s.key === "carbGrams");
    const fat = result.secondary.find((s) => s.key === "fatGrams");
    expect(carb!.value).toBe(200); // 800/4
    expect(fat!.value).toBe(67); // 600/9=66.67 -> 67
  });

  it("rejects percentages that don't sum to 100", () => {
    expect(() => macroSchema.parse({ dailyCalories: "2000", proteinPercent: "30", carbPercent: "30", fatPercent: "30" })).toThrow();
  });
});
