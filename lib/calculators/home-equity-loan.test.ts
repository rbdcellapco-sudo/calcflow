import { describe, it, expect } from "vitest";
import { homeEquityLoanCalculator, homeEquityLoanSchema } from "./home-equity-loan";

function calc(input: Record<string, string>) {
  return homeEquityLoanCalculator.calculate(homeEquityLoanSchema.parse(input) as never);
}

describe("home equity loan calculator", () => {
  it("computes a monthly payment and combined LTV", () => {
    const result = calc({ homeValue: "400000", existingMortgageBalance: "200000", loanAmount: "50000", interestRate: "8", termYears: "15" });
    expect(result.primary.value as number).toBeGreaterThan(0);
    const ltv = result.secondary.find((s) => s.key === "combinedLtv");
    // (200000+50000)/400000 = 62.5%
    expect(ltv!.value as number).toBeCloseTo(62.5, 1);
  });

  it("flags a high combined LTV", () => {
    const result = calc({ homeValue: "300000", existingMortgageBalance: "220000", loanAmount: "60000", interestRate: "8", termYears: "15" });
    expect(result.notes).toBeDefined();
  });
});
