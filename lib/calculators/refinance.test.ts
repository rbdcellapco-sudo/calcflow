import { describe, it, expect } from "vitest";
import { refinanceCalculator, refinanceSchema } from "./refinance";

function calc(input: Record<string, string>) {
  return refinanceCalculator.calculate(refinanceSchema.parse(input) as never);
}

describe("refinance calculator", () => {
  it("shows positive savings when the new rate is meaningfully lower", () => {
    const result = calc({ currentBalance: "300000", currentRate: "7", currentRemainingYears: "25", newRate: "5", newTermYears: "25" });
    expect(result.primary.value as number).toBeGreaterThan(0);
  });

  it("computes a break-even period when closing costs are given", () => {
    const result = calc({ currentBalance: "300000", currentRate: "7", currentRemainingYears: "25", newRate: "5", newTermYears: "25", closingCosts: "5000" });
    const breakEven = result.secondary.find((s) => s.key === "breakEvenMonths");
    expect(breakEven).toBeDefined();
    expect(breakEven!.value as number).toBeGreaterThan(0);
  });

  it("notes when the new payment isn't lower", () => {
    const result = calc({ currentBalance: "300000", currentRate: "3", currentRemainingYears: "10", newRate: "3", newTermYears: "10" });
    expect(result.notes).toBeDefined();
  });
});
