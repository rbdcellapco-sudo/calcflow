import { describe, it, expect } from "vitest";
import { retirementCalculator, retirementSchema } from "./retirement";

function calc(input: Record<string, string>) {
  return retirementCalculator.calculate(retirementSchema.parse(input) as never);
}

describe("retirement calculator", () => {
  it("projects growth over the working years", () => {
    const result = calc({ currentAge: "30", retirementAge: "65", currentSavings: "10000", monthlyContribution: "500", annualReturn: "7" });
    expect(result.primary.value as number).toBeGreaterThan(10000);
  });

  it("more years to grow yields a bigger nest egg, all else equal", () => {
    const soon = calc({ currentAge: "55", retirementAge: "65", currentSavings: "10000", monthlyContribution: "500", annualReturn: "7" });
    const later = calc({ currentAge: "30", retirementAge: "65", currentSavings: "10000", monthlyContribution: "500", annualReturn: "7" });
    expect(later.primary.value as number).toBeGreaterThan(soon.primary.value as number);
  });

  it("rejects a retirement age before the current age", () => {
    expect(() =>
      retirementSchema.parse({ currentAge: "50", retirementAge: "40", currentSavings: "0", monthlyContribution: "100", annualReturn: "5" })
    ).toThrow();
  });
});
