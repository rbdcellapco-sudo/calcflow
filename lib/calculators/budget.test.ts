import { describe, it, expect } from "vitest";
import { budgetCalculator, budgetSchema } from "./budget";

function calc(input: Record<string, string>) {
  return budgetCalculator.calculate(budgetSchema.parse(input) as never);
}

describe("budget calculator", () => {
  it("computes 50/30/20 targets", () => {
    const result = calc({ monthlyIncome: "5000" });
    const needs = result.secondary.find((s) => s.key === "targetNeeds");
    const wants = result.secondary.find((s) => s.key === "targetWants");
    const savings = result.secondary.find((s) => s.key === "targetSavings");
    expect(needs!.value as number).toBeCloseTo(2500, 2);
    expect(wants!.value as number).toBeCloseTo(1500, 2);
    expect(savings!.value as number).toBeCloseTo(1000, 2);
  });

  it("flags over-budget spending", () => {
    const result = calc({ monthlyIncome: "5000", needsSpending: "3000", wantsSpending: "2000", savingsAmount: "500" });
    const remaining = result.secondary.find((s) => s.key === "remaining");
    expect(remaining!.label).toMatch(/over budget/i);
  });

  it("omits actual-vs-target fields when no actuals are given", () => {
    const result = calc({ monthlyIncome: "5000" });
    expect(result.secondary.find((s) => s.key === "remaining")).toBeUndefined();
  });
});
