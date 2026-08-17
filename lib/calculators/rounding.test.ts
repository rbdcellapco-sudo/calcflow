import { describe, it, expect } from "vitest";
import { roundingCalculator, roundingSchema } from "./rounding";

function calc(input: Record<string, string>) {
  return roundingCalculator.calculate(roundingSchema.parse(input) as never);
}

describe("rounding calculator", () => {
  it("rounds to decimal places", () => {
    const result = calc({ mode: "decimal-places", value: "3.14159", digits: "2" });
    expect(result.primary.value).toBe(3.14);
  });

  it("rounds to significant figures", () => {
    const result = calc({ mode: "significant-figures", value: "0.004567", digits: "2" });
    expect(result.primary.value).toBeCloseTo(0.0046, 5);
  });
});
