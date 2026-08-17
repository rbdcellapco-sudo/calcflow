import { describe, it, expect } from "vitest";
import { houseAffordabilityCalculator, houseAffordabilitySchema } from "./house-affordability";

function calc(input: Record<string, string>) {
  return houseAffordabilityCalculator.calculate(houseAffordabilitySchema.parse(input) as never);
}

describe("house affordability calculator", () => {
  it("computes an affordable home price greater than the down payment", () => {
    const result = calc({ grossAnnualIncome: "100000", downPayment: "40000", interestRate: "6", termYears: "30" });
    expect(result.primary.value as number).toBeGreaterThan(40000);
  });

  it("more other debt reduces the affordable home price", () => {
    const noDebt = calc({ grossAnnualIncome: "100000", downPayment: "40000", interestRate: "6", termYears: "30" });
    const withDebt = calc({ grossAnnualIncome: "100000", downPayment: "40000", interestRate: "6", termYears: "30", monthlyDebtPayments: "1000" });
    expect(withDebt.primary.value as number).toBeLessThan(noDebt.primary.value as number);
  });

  it("the estimated loan amount plus down payment roughly equals the home price", () => {
    const result = calc({ grossAnnualIncome: "120000", downPayment: "50000", interestRate: "6.5", termYears: "30" });
    const loanAmount = result.secondary.find((s) => s.key === "loanAmount")!.value as number;
    expect(loanAmount + 50000).toBeCloseTo(result.primary.value as number, 0);
  });
});
