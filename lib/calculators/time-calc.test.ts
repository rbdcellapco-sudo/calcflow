import { describe, it, expect } from "vitest";
import { timeCalcCalculator, timeCalcSchema } from "./time-calc";

function calc(input: Record<string, string>) {
  return timeCalcCalculator.calculate(timeCalcSchema.parse(input) as never);
}

describe("time calculator", () => {
  it("adds two durations", () => {
    const result = calc({ h1: "2", m1: "30", op: "add", h2: "1", m2: "45" });
    expect(result.primary.value).toBe("4h 15m 0s");
  });

  it("subtracts and shows a negative result", () => {
    const result = calc({ h1: "1", m1: "0", op: "subtract", h2: "2", m2: "0" });
    expect(result.primary.value).toBe("-1h 0m 0s");
  });
});
