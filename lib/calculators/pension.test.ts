import { describe, it, expect } from "vitest";
import { pensionCalculator, pensionSchema } from "./pension";

function calc(input: Record<string, string>) {
  return pensionCalculator.calculate(pensionSchema.parse(input) as never);
}

describe("pension calculator", () => {
  it("computes annual benefit from accrual formula", () => {
    const result = calc({ yearsOfService: "20", accrualRate: "1.5", finalAverageSalary: "80000" });
    // 80000 * 0.015 * 20 = 24000
    expect(result.primary.value).toBeCloseTo(24000, 2);
  });

  it("more years of service yields a bigger pension, all else equal", () => {
    const fewer = calc({ yearsOfService: "10", accrualRate: "1.5", finalAverageSalary: "80000" });
    const more = calc({ yearsOfService: "30", accrualRate: "1.5", finalAverageSalary: "80000" });
    expect(more.primary.value as number).toBeGreaterThan(fewer.primary.value as number);
  });
});
