import { describe, it, expect } from "vitest";
import { statisticsCalculator, statisticsSchema } from "./statistics";

function calc(input: Record<string, string>) {
  return statisticsCalculator.calculate(statisticsSchema.parse(input) as never);
}

describe("statistics calculator", () => {
  it("computes mean, median, and range", () => {
    const result = calc({ data: "2, 4, 4, 4, 5, 5, 7, 9" });
    expect(result.primary.value).toBe(5);
    expect(result.secondary.find((s) => s.key === "median")!.value).toBe(4.5);
    expect(result.secondary.find((s) => s.key === "range")!.value).toBe(7);
  });

  it("computes population standard deviation", () => {
    const result = calc({ data: "2, 4, 4, 4, 5, 5, 7, 9" });
    const stdDev = result.secondary.find((s) => s.key === "stdDev");
    expect(stdDev!.value as number).toBeCloseTo(2, 2);
  });

  it("identifies the mode", () => {
    const result = calc({ data: "1, 2, 2, 3" });
    const mode = result.secondary.find((s) => s.key === "mode");
    expect(mode!.value).toBe("2");
  });

  it("rejects non-numeric input", () => {
    expect(() => statisticsSchema.parse({ data: "1, two, 3" })).toThrow();
  });
});
