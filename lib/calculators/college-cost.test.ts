import { describe, it, expect } from "vitest";
import { collegeCostCalculator, collegeCostSchema } from "./college-cost";

function calc(input: Record<string, string>) {
  return collegeCostCalculator.calculate(collegeCostSchema.parse(input) as never);
}

describe("college cost calculator", () => {
  it("computes total cost with zero inflation as a flat multiple", () => {
    const result = calc({ currentAnnualCost: "20000", yearsUntilEnrollment: "0", yearsInCollege: "4", inflationRate: "0" });
    expect(result.primary.value).toBeCloseTo(80000, 2);
  });

  it("inflation increases the projected total cost", () => {
    const noInflation = calc({ currentAnnualCost: "20000", yearsUntilEnrollment: "10", yearsInCollege: "4", inflationRate: "0" });
    const withInflation = calc({ currentAnnualCost: "20000", yearsUntilEnrollment: "10", yearsInCollege: "4", inflationRate: "5" });
    expect(withInflation.primary.value as number).toBeGreaterThan(noInflation.primary.value as number);
  });

  it("computes a shortfall when savings won't cover the projected cost", () => {
    const result = calc({ currentAnnualCost: "20000", yearsUntilEnrollment: "10", yearsInCollege: "4", inflationRate: "5", currentSavings: "1000", annualReturn: "5" });
    const shortfall = result.secondary.find((s) => s.key === "shortfall");
    expect(shortfall).toBeDefined();
  });
});
