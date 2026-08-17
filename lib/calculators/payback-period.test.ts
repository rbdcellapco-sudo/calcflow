import { describe, it, expect } from "vitest";
import { paybackPeriodCalculator, paybackPeriodSchema } from "./payback-period";

function calc(input: Record<string, string>) {
  return paybackPeriodCalculator.calculate(paybackPeriodSchema.parse(input) as never);
}

describe("payback period calculator - simple", () => {
  it("computes simple payback period", () => {
    const result = calc({ initialInvestment: "10000", annualCashFlow: "2500" });
    expect(result.primary.value).toBeCloseTo(4, 2);
  });
});

describe("payback period calculator - discounted", () => {
  it("discounted payback is longer than simple payback", () => {
    const simple = calc({ initialInvestment: "10000", annualCashFlow: "2500" });
    const discounted = calc({ initialInvestment: "10000", annualCashFlow: "2500", discountRate: "10" });
    expect(discounted.primary.value as number).toBeGreaterThan(simple.primary.value as number);
  });

  it("reports no solution when cash flows never repay the investment at a high discount rate", () => {
    const result = calc({ initialInvestment: "1000000", annualCashFlow: "1000", discountRate: "50" });
    expect(result.primary.format).toBe("text");
  });
});
