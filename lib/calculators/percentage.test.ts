import { describe, it, expect } from "vitest";
import { percentageCalculator, percentageSchema } from "./percentage";

function calc(input: Record<string, string>) {
  const parsed = percentageSchema.parse(input);
  return percentageCalculator.calculate(parsed as never);
}

describe("percentage calculator - X% of Y", () => {
  it("computes a basic percentage of a number", () => {
    const result = calc({ mode: "of", value1: "20", value2: "50" });
    expect(result.primary.value).toBeCloseTo(10, 10);
  });

  it("handles 0%", () => {
    const result = calc({ mode: "of", value1: "0", value2: "500" });
    expect(result.primary.value).toBe(0);
  });

  it("handles percentages over 100%", () => {
    const result = calc({ mode: "of", value1: "150", value2: "10" });
    expect(result.primary.value).toBeCloseTo(15, 10);
  });
});

describe("percentage calculator - X is what % of Y", () => {
  it("computes what percent one value is of another", () => {
    const result = calc({ mode: "what-percent", value1: "25", value2: "200" });
    expect(result.primary.value).toBeCloseTo(12.5, 10);
  });

  it("rejects a zero whole via schema validation", () => {
    expect(() => percentageSchema.parse({ mode: "what-percent", value1: "10", value2: "0" })).toThrow();
  });
});

describe("percentage calculator - percentage change", () => {
  it("computes percentage increase", () => {
    const result = calc({ mode: "change", value1: "100", value2: "150" });
    expect(result.primary.label).toBe("Percentage increase");
    expect(result.primary.value).toBeCloseTo(50, 10);
  });

  it("computes percentage decrease", () => {
    const result = calc({ mode: "change", value1: "200", value2: "150" });
    expect(result.primary.label).toBe("Percentage decrease");
    expect(result.primary.value).toBeCloseTo(25, 10);
  });

  it("rejects a zero starting value via schema validation", () => {
    expect(() => percentageSchema.parse({ mode: "change", value1: "0", value2: "10" })).toThrow();
  });
});
