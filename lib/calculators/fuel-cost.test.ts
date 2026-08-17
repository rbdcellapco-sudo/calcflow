import { describe, it, expect } from "vitest";
import { fuelCostCalculator, fuelCostSchema } from "./fuel-cost";

function calc(input: Record<string, string>) {
  return fuelCostCalculator.calculate(fuelCostSchema.parse(input) as never);
}

describe("fuel cost calculator", () => {
  it("computes total fuel cost for a trip", () => {
    const result = calc({ distance: "300", fuelEfficiency: "30", fuelPrice: "3.5" });
    // 300/30=10 gal * 3.5 = 35
    expect(result.primary.value).toBe(35);
  });
});
