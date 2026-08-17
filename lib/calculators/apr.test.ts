import { describe, it, expect } from "vitest";
import { aprCalculator, aprSchema } from "./apr";

function calc(input: Record<string, string>) {
  return aprCalculator.calculate(aprSchema.parse(input) as never);
}

describe("apr calculator", () => {
  it("equals the nominal rate when there are no fees", () => {
    const result = calc({ loanAmount: "200000", interestRate: "6", fees: "0", termYears: "30" });
    expect(result.primary.value as number).toBeCloseTo(6, 1);
  });

  it("is higher than the nominal rate when fees are charged", () => {
    const result = calc({ loanAmount: "200000", interestRate: "6", fees: "4000", termYears: "30" });
    expect(result.primary.value as number).toBeGreaterThan(6);
  });

  it("higher fees produce a higher APR", () => {
    const lowFees = calc({ loanAmount: "200000", interestRate: "6", fees: "2000", termYears: "30" });
    const highFees = calc({ loanAmount: "200000", interestRate: "6", fees: "8000", termYears: "30" });
    expect(highFees.primary.value as number).toBeGreaterThan(lowFees.primary.value as number);
  });
});
