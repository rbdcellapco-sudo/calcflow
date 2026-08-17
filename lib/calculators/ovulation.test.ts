import { describe, it, expect } from "vitest";
import { ovulationCalculator, ovulationSchema } from "./ovulation";

function calc(input: Record<string, string>) {
  return ovulationCalculator.calculate(ovulationSchema.parse(input) as never);
}

describe("ovulation calculator", () => {
  it("computes ovulation date as cycle length minus 14 days from LMP", () => {
    const result = calc({ lastPeriodStart: "2025-01-01", cycleLength: "28" });
    expect(result.primary.value).toBe("January 15, 2025");
  });

  it("computes the fertile window around ovulation", () => {
    const result = calc({ lastPeriodStart: "2025-01-01", cycleLength: "28" });
    const window = result.secondary.find((s) => s.key === "fertileWindow");
    expect(window!.value).toBe("Jan 10 – Jan 16, 2025");
  });

  it("rejects a future last period date", () => {
    expect(() => ovulationSchema.parse({ lastPeriodStart: "2099-01-01", cycleLength: "28" })).toThrow();
  });
});
