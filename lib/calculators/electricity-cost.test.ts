import { describe, it, expect } from "vitest";
import { electricityCostCalculator, electricityCostSchema } from "./electricity-cost";

function calc(input: Record<string, string>) {
  return electricityCostCalculator.calculate(electricityCostSchema.parse(input) as never);
}

describe("electricity cost calculator", () => {
  it("computes monthly cost", () => {
    const result = calc({ watts: "100", hoursPerDay: "5", costPerKwh: "0.15" });
    // 0.1kW*5h=0.5kWh/day * 0.15 = 0.075/day * 30 = 2.25
    expect(result.primary.value).toBeCloseTo(2.25, 2);
  });
});
