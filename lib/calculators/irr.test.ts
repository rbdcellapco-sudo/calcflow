import { describe, it, expect } from "vitest";
import { irrCalculator, irrSchema } from "./irr";

function calc(input: Record<string, string>) {
  return irrCalculator.calculate(irrSchema.parse(input) as never);
}

describe("irr calculator", () => {
  it("computes a known IRR (single cash flow round trip)", () => {
    // -1000 now, +1100 in year 1 => IRR = 10%
    const result = calc({ initialInvestment: "1000", year1: "1100" });
    expect(result.primary.value).toBeCloseTo(10, 1);
  });

  it("computes IRR across multiple years of cash flow", () => {
    const result = calc({ initialInvestment: "1000", year1: "300", year2: "300", year3: "300", year4: "300", year5: "300" });
    expect(typeof result.primary.value).toBe("number");
    expect(result.primary.value as number).toBeGreaterThan(0);
  });

  it("returns a percentage-formatted result for a solvable series", () => {
    const result = calc({ initialInvestment: "1000", year1: "1100" });
    expect(result.primary.format).toBe("percentage");
  });
});
