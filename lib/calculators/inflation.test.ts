import { describe, it, expect } from "vitest";
import { inflationCalculator, inflationSchema } from "./inflation";

function calc(input: Record<string, string>) {
  return inflationCalculator.calculate(inflationSchema.parse(input) as never);
}

describe("inflation calculator", () => {
  it("computes future cost with compounding inflation", () => {
    const result = calc({ amount: "1000", years: "10", inflationRate: "5" });
    expect(result.primary.value).toBeCloseTo(1628.89, 1);
  });

  it("zero years leaves the amount unchanged", () => {
    const result = calc({ amount: "1000", years: "0", inflationRate: "5" });
    expect(result.primary.value).toBeCloseTo(1000, 2);
  });
});
