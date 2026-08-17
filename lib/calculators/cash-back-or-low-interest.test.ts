import { describe, it, expect } from "vitest";
import { cashBackOrLowInterestCalculator, cashBackOrLowInterestSchema } from "./cash-back-or-low-interest";

function calc(input: Record<string, string>) {
  return cashBackOrLowInterestCalculator.calculate(cashBackOrLowInterestSchema.parse(input) as never);
}

describe("cash back or low interest calculator", () => {
  it("picks low interest when the rate spread is large and cash back is small", () => {
    const result = calc({ vehiclePrice: "30000", cashBackAmount: "500", standardApr: "9", lowApr: "0", termMonths: "60" });
    expect(result.primary.value).toBe("Low interest rate");
  });

  it("picks cash back when the rate spread is small and the rebate is large", () => {
    const result = calc({ vehiclePrice: "30000", cashBackAmount: "3000", standardApr: "5", lowApr: "4.5", termMonths: "36" });
    expect(result.primary.value).toBe("Cash back");
  });
});
