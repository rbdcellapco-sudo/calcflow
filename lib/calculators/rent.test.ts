import { describe, it, expect } from "vitest";
import { rentCalculator, rentSchema } from "./rent";

function calc(input: Record<string, string>) {
  return rentCalculator.calculate(rentSchema.parse(input) as never);
}

describe("rent calculator", () => {
  it("computes 30% of gross monthly income by default", () => {
    const result = calc({ grossMonthlyIncome: "5000" });
    expect(result.primary.value).toBeCloseTo(1500, 2);
  });

  it("subtracts other debt in the adjusted figure", () => {
    const result = calc({ grossMonthlyIncome: "5000", monthlyDebtPayments: "500" });
    const adjusted = result.secondary.find((s) => s.key === "maxRentAfterDebt");
    expect(adjusted!.value as number).toBeCloseTo(1000, 2);
  });
});
