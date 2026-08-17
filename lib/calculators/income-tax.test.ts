import { describe, it, expect } from "vitest";
import { incomeTaxCalculator, incomeTaxSchema } from "./income-tax";

function calc(input: Record<string, string>) {
  return incomeTaxCalculator.calculate(incomeTaxSchema.parse(input) as never);
}

describe("income tax calculator", () => {
  it("applies the 87A rebate at or below 7 lakh taxable income", () => {
    const result = calc({ annualIncome: "700000", standardDeduction: "0" });
    expect(result.primary.value).toBe(0);
  });

  it("computes progressive tax above the rebate threshold", () => {
    const result = calc({ annualIncome: "975000", standardDeduction: "75000" });
    // taxable = 900000: 0 on first 3L, 5% on next 4L (20000), 10% on next 2L (20000) = 40000, +4% cess = 41600
    expect(result.primary.value as number).toBeCloseTo(41600, 0);
  });

  it("higher income yields higher effective rate", () => {
    const lower = calc({ annualIncome: "800000", standardDeduction: "75000" });
    const higher = calc({ annualIncome: "2000000", standardDeduction: "75000" });
    const lowerRate = lower.secondary.find((s) => s.key === "effectiveRate")!.value as number;
    const higherRate = higher.secondary.find((s) => s.key === "effectiveRate")!.value as number;
    expect(higherRate).toBeGreaterThan(lowerRate);
  });
});
