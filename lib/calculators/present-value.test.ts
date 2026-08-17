import { describe, it, expect } from "vitest";
import { presentValueCalculator, presentValueSchema } from "./present-value";

function calc(input: Record<string, string>) {
  return presentValueCalculator.calculate(presentValueSchema.parse(input) as never);
}

describe("present value calculator", () => {
  it("discounts a future value back to today (annual compounding)", () => {
    const result = calc({ futureValue: "1628.89", annualRate: "5", years: "10", frequency: "annually" });
    expect(result.primary.value).toBeCloseTo(1000, 0);
  });

  it("returns the same value when years is 0", () => {
    const result = calc({ futureValue: "500", annualRate: "5", years: "0", frequency: "annually" });
    expect(result.primary.value).toBeCloseTo(500, 2);
  });

  it("monthly compounding discounts more than annual for the same nominal rate", () => {
    const annual = calc({ futureValue: "1000", annualRate: "5", years: "10", frequency: "annually" });
    const monthly = calc({ futureValue: "1000", annualRate: "5", years: "10", frequency: "monthly" });
    expect(monthly.primary.value as number).toBeLessThan(annual.primary.value as number);
  });
});
