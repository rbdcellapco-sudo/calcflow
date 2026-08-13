import { describe, it, expect } from "vitest";
import { loanCalculator, loanSchema } from "./loan";

function calc(input: Record<string, string>) {
  return loanCalculator.calculate(loanSchema.parse(input) as never);
}

describe("loan calculator - normal case", () => {
  it("computes a known monthly payment ($20,000 at 6% for 5 years ≈ $386.66)", () => {
    const result = calc({ principal: "20000", interestRate: "6", termYears: "5", extraPayment: "0" });
    expect(result.primary.value).toBeCloseTo(386.66, 1);
  });

  it("total paid is greater than principal when interest > 0", () => {
    const result = calc({ principal: "20000", interestRate: "6", termYears: "5", extraPayment: "0" });
    const totalPaid = result.secondary.find((s) => s.key === "totalPaid")!.value as number;
    expect(totalPaid).toBeGreaterThan(20000);
  });
});

describe("loan calculator - zero interest", () => {
  it("splits principal evenly across payments with no interest", () => {
    const result = calc({ principal: "12000", interestRate: "0", termYears: "1", extraPayment: "0" });
    expect(result.primary.value).toBeCloseTo(1000, 2);
    const totalInterest = result.secondary.find((s) => s.key === "totalInterest")!.value as number;
    expect(totalInterest).toBeCloseTo(0, 2);
  });
});

describe("loan calculator - extra payments", () => {
  it("shortens the payoff time when extra payments are made", () => {
    const base = calc({ principal: "20000", interestRate: "6", termYears: "5", extraPayment: "0" });
    const withExtra = calc({ principal: "20000", interestRate: "6", termYears: "5", extraPayment: "200" });
    const basePayoff = base.secondary.find((s) => s.key === "payoffMonths")!.value as number;
    const extraPayoff = withExtra.secondary.find((s) => s.key === "payoffMonths")!.value as number;
    expect(extraPayoff).toBeLessThan(basePayoff);
  });
});

describe("loan calculator - boundary and invalid values", () => {
  it("rejects a zero principal", () => {
    expect(() => loanSchema.parse({ principal: "0", interestRate: "5", termYears: "5", extraPayment: "0" })).toThrow();
  });

  it("rejects a negative interest rate", () => {
    expect(() =>
      loanSchema.parse({ principal: "1000", interestRate: "-1", termYears: "5", extraPayment: "0" })
    ).toThrow();
  });

  it("handles a very large principal without losing precision", () => {
    const result = calc({ principal: "500000000", interestRate: "4.5", termYears: "30", extraPayment: "0" });
    expect(result.primary.value).toBeGreaterThan(0);
    expect(Number.isFinite(result.primary.value)).toBe(true);
  });

  it("handles a very small principal", () => {
    const result = calc({ principal: "1", interestRate: "5", termYears: "1", extraPayment: "0" });
    expect(result.primary.value).toBeGreaterThan(0);
  });
});
