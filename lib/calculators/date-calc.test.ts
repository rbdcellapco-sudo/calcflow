import { describe, it, expect } from "vitest";
import { dateCalcCalculator, dateCalcSchema } from "./date-calc";

function calc(input: Record<string, string>) {
  return dateCalcCalculator.calculate(dateCalcSchema.parse(input) as never);
}

describe("date calculator - difference", () => {
  it("computes days between two dates", () => {
    const result = calc({ mode: "difference", startDate: "2025-01-01", endDate: "2025-01-31" });
    expect(result.primary.value).toBe(30);
  });
});

describe("date calculator - add/subtract", () => {
  it("adds days to a date", () => {
    const result = calc({ mode: "add-subtract", startDate: "2025-01-01", amount: "10", unit: "days", direction: "add" });
    expect(result.primary.value).toBe("Saturday, January 11, 2025");
  });

  it("subtracts months from a date", () => {
    const result = calc({ mode: "add-subtract", startDate: "2025-06-15", amount: "2", unit: "months", direction: "subtract" });
    expect(result.primary.value).toBe("Tuesday, April 15, 2025");
  });
});
