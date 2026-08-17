import { describe, it, expect } from "vitest";
import { discountCalculator, discountSchema } from "./discount";

function calc(input: Record<string, string>) {
  return discountCalculator.calculate(discountSchema.parse(input) as never);
}

describe("discount calculator", () => {
  it("computes a simple discount", () => {
    const result = calc({ originalPrice: "100", discountPercent: "20" });
    expect(result.primary.value).toBeCloseTo(80, 2);
  });

  it("stacked discounts don't simply add", () => {
    const result = calc({ originalPrice: "100", discountPercent: "20", additionalDiscountPercent: "10" });
    // 100 * 0.8 * 0.9 = 72, not 100*0.7=70
    expect(result.primary.value).toBeCloseTo(72, 2);
  });
});
