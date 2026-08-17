import { describe, it, expect } from "vitest";
import { bondCalculator, bondSchema } from "./bond";

function calc(input: Record<string, string>) {
  return bondCalculator.calculate(bondSchema.parse(input) as never);
}

describe("bond calculator", () => {
  it("YTM equals the coupon rate when trading at par", () => {
    const result = calc({ faceValue: "1000", couponRate: "5", marketPrice: "1000", yearsToMaturity: "10", paymentsPerYear: "annual" });
    expect(result.primary.value as number).toBeCloseTo(5, 1);
  });

  it("YTM is higher than the coupon rate when trading below par", () => {
    const result = calc({ faceValue: "1000", couponRate: "5", marketPrice: "900", yearsToMaturity: "10", paymentsPerYear: "annual" });
    expect(result.primary.value as number).toBeGreaterThan(5);
  });

  it("YTM is lower than the coupon rate when trading above par", () => {
    const result = calc({ faceValue: "1000", couponRate: "5", marketPrice: "1100", yearsToMaturity: "10", paymentsPerYear: "annual" });
    expect(result.primary.value as number).toBeLessThan(5);
  });
});
