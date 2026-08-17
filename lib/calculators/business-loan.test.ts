import { describe, it, expect } from "vitest";
import { businessLoanCalculator, businessLoanSchema } from "./business-loan";

function calc(input: Record<string, string>) {
  return businessLoanCalculator.calculate(businessLoanSchema.parse(input) as never);
}

describe("business loan calculator", () => {
  it("computes a monthly payment", () => {
    const result = calc({ loanAmount: "100000", interestRate: "8", termYears: "5" });
    expect(result.primary.value as number).toBeGreaterThan(0);
  });

  it("shows net proceeds reduced by an origination fee", () => {
    const result = calc({ loanAmount: "100000", interestRate: "8", termYears: "5", originationFeePercent: "3" });
    const net = result.secondary.find((s) => s.key === "netProceeds");
    expect(net!.value as number).toBeCloseTo(97000, 2);
  });

  it("omits fee fields when no fee is given", () => {
    const result = calc({ loanAmount: "100000", interestRate: "8", termYears: "5" });
    expect(result.secondary.find((s) => s.key === "netProceeds")).toBeUndefined();
  });
});
