import { describe, it, expect } from "vitest";
import { mutualFundCalculator, mutualFundSchema } from "./mutual-fund";

function calc(input: Record<string, string>) {
  return mutualFundCalculator.calculate(mutualFundSchema.parse(input) as never);
}

describe("mutual fund calculator", () => {
  it("projects growth from a lump sum and SIP", () => {
    const result = calc({ initialInvestment: "50000", monthlyInvestment: "5000", annualReturnRate: "12", years: "15" });
    expect(result.primary.value as number).toBeGreaterThan(50000 + 5000 * 12 * 15);
  });

  it("an expense ratio reduces the projected value", () => {
    const noFee = calc({ initialInvestment: "50000", monthlyInvestment: "5000", annualReturnRate: "12", years: "15", expenseRatio: "0" });
    const withFee = calc({ initialInvestment: "50000", monthlyInvestment: "5000", annualReturnRate: "12", years: "15", expenseRatio: "1.5" });
    expect(withFee.primary.value as number).toBeLessThan(noFee.primary.value as number);
  });
});
