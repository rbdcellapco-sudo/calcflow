import { describe, it, expect } from "vitest";
import { simpleInterestCalculator, simpleInterestSchema } from "./simple-interest";

function calc(input: Record<string, string>) {
  return simpleInterestCalculator.calculate(simpleInterestSchema.parse(input) as never);
}

describe("simple interest calculator", () => {
  it("computes interest and total for a normal case", () => {
    const result = calc({ principal: "1000", annualRate: "5", years: "3" });
    // 1000 * 0.05 * 3 = 150
    expect(result.primary.value).toBeCloseTo(1150, 2);
    expect(result.secondary.find((s) => s.key === "interest")?.value).toBeCloseTo(150, 2);
  });

  it("handles zero rate", () => {
    const result = calc({ principal: "1000", annualRate: "0", years: "5" });
    expect(result.primary.value).toBeCloseTo(1000, 2);
  });

  it("handles zero years", () => {
    const result = calc({ principal: "1000", annualRate: "5", years: "0" });
    expect(result.primary.value).toBeCloseTo(1000, 2);
  });

  it("rejects a negative principal", () => {
    expect(() => simpleInterestSchema.parse({ principal: "-1", annualRate: "5", years: "1" })).toThrow();
  });
});
