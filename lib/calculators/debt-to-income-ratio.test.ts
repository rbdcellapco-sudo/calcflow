import { describe, it, expect } from "vitest";
import { debtToIncomeRatioCalculator, debtToIncomeRatioSchema } from "./debt-to-income-ratio";

function calc(input: Record<string, string>) {
  return debtToIncomeRatioCalculator.calculate(debtToIncomeRatioSchema.parse(input) as never);
}

describe("debt to income ratio calculator", () => {
  it("computes DTI percentage", () => {
    const result = calc({ monthlyDebtPayments: "1800", grossMonthlyIncome: "6000" });
    expect(result.primary.value).toBeCloseTo(30, 2);
  });

  it("flags a high DTI", () => {
    const result = calc({ monthlyDebtPayments: "3200", grossMonthlyIncome: "6000" });
    expect(result.notes?.[0]).toMatch(/high/i);
  });
});
