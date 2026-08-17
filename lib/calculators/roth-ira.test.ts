import { describe, it, expect } from "vitest";
import { rothIraCalculator, rothIraSchema } from "./roth-ira";

function calc(input: Record<string, string>) {
  return rothIraCalculator.calculate(rothIraSchema.parse(input) as never);
}

describe("roth ira calculator", () => {
  it("projects tax-free growth", () => {
    const result = calc({ currentAge: "25", retirementAge: "65", currentBalance: "0", annualContribution: "6000", annualReturn: "7" });
    expect(result.primary.value as number).toBeGreaterThan(6000 * 40);
  });

  it("more years yields a bigger balance, all else equal", () => {
    const shorter = calc({ currentAge: "50", retirementAge: "65", currentBalance: "0", annualContribution: "6000", annualReturn: "7" });
    const longer = calc({ currentAge: "25", retirementAge: "65", currentBalance: "0", annualContribution: "6000", annualReturn: "7" });
    expect(longer.primary.value as number).toBeGreaterThan(shorter.primary.value as number);
  });
});
