import { describe, it, expect } from "vitest";
import { helocCalculator, helocSchema } from "./heloc";

function calc(input: Record<string, string>) {
  return helocCalculator.calculate(helocSchema.parse(input) as never);
}

describe("heloc calculator", () => {
  it("computes an interest-only draw-period payment", () => {
    const result = calc({ homeValue: "400000", existingMortgageBalance: "200000", drawAmount: "50000", interestRate: "8", creditLimitPercent: "80", repaymentTermYears: "10" });
    // 50000 * 0.08 / 12 = 333.33
    expect(result.primary.value as number).toBeCloseTo(333.33, 1);
  });

  it("computes a larger repayment-period payment than the interest-only payment", () => {
    const result = calc({ homeValue: "400000", existingMortgageBalance: "200000", drawAmount: "50000", interestRate: "8", creditLimitPercent: "80", repaymentTermYears: "10" });
    const repayment = result.secondary.find((s) => s.key === "repaymentPayment");
    expect(repayment!.value as number).toBeGreaterThan(result.primary.value as number);
  });

  it("flags when the draw exceeds the estimated max credit line", () => {
    const result = calc({ homeValue: "200000", existingMortgageBalance: "150000", drawAmount: "50000", interestRate: "8", creditLimitPercent: "80", repaymentTermYears: "10" });
    expect(result.notes).toBeDefined();
  });
});
