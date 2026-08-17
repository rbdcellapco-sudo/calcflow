import { describe, it, expect } from "vitest";
import { periodCalculator, periodSchema } from "./period";

function calc(input: Record<string, string>) {
  return periodCalculator.calculate(periodSchema.parse(input) as never);
}

describe("period calculator", () => {
  it("predicts the next period date range", () => {
    const result = calc({ lastPeriodStart: "2025-01-01", cycleLength: "28", periodLength: "5" });
    expect(result.primary.value).toBe("Jan 29 – Feb 2, 2025");
  });

  it("predicts subsequent cycles further out", () => {
    const result = calc({ lastPeriodStart: "2025-01-01", cycleLength: "28", periodLength: "5" });
    const cycle3 = result.secondary.find((s) => s.key === "cycle3");
    expect(cycle3!.value).toBe("Mar 26 – Mar 30, 2025");
  });
});
