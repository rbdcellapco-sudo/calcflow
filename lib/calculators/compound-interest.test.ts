import { describe, it, expect } from "vitest";
import { compoundInterestCalculator, compoundInterestSchema } from "./compound-interest";

function calc(input: Record<string, string>) {
  return compoundInterestCalculator.calculate(compoundInterestSchema.parse(input) as never);
}

describe("compound interest calculator - normal case", () => {
  it("computes annual compounding correctly ($1000 at 5% for 10 years)", () => {
    const result = calc({
      principal: "1000",
      annualRate: "5",
      years: "10",
      frequency: "annually",
      contributionPerPeriod: "0",
    });
    // 1000 * 1.05^10 = 1628.894...
    expect(result.primary.value).toBeCloseTo(1628.89, 1);
  });

  it("monthly compounding yields more than annual compounding at the same nominal rate", () => {
    const annual = calc({ principal: "1000", annualRate: "5", years: "10", frequency: "annually", contributionPerPeriod: "0" });
    const monthly = calc({ principal: "1000", annualRate: "5", years: "10", frequency: "monthly", contributionPerPeriod: "0" });
    expect(monthly.primary.value as number).toBeGreaterThan(annual.primary.value as number);
  });
});

describe("compound interest calculator - contributions", () => {
  it("increases future value with regular contributions", () => {
    const withoutContrib = calc({ principal: "1000", annualRate: "5", years: "10", frequency: "monthly", contributionPerPeriod: "0" });
    const withContrib = calc({ principal: "1000", annualRate: "5", years: "10", frequency: "monthly", contributionPerPeriod: "100" });
    expect(withContrib.primary.value as number).toBeGreaterThan(withoutContrib.primary.value as number);
  });
});

describe("compound interest calculator - zero and boundary cases", () => {
  it("handles 0% interest rate as simple accumulation of contributions", () => {
    const result = calc({ principal: "1000", annualRate: "0", years: "2", frequency: "monthly", contributionPerPeriod: "50" });
    // 1000 + 50*24 = 2200
    expect(result.primary.value).toBeCloseTo(2200, 2);
  });

  it("handles zero years (no growth)", () => {
    const result = calc({ principal: "1000", annualRate: "5", years: "0", frequency: "monthly", contributionPerPeriod: "0" });
    expect(result.primary.value).toBeCloseTo(1000, 2);
  });
});

describe("compound interest calculator - invalid values", () => {
  it("rejects a negative principal", () => {
    expect(() =>
      compoundInterestSchema.parse({ principal: "-1", annualRate: "5", years: "10", frequency: "annually", contributionPerPeriod: "0" })
    ).toThrow();
  });
});
