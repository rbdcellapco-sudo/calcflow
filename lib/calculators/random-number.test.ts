import { describe, it, expect } from "vitest";
import { randomNumberCalculator, randomNumberSchema } from "./random-number";

function calc(input: Record<string, string>) {
  return randomNumberCalculator.calculate(randomNumberSchema.parse(input) as never);
}

describe("random number generator", () => {
  it("generates numbers within the requested range", () => {
    const result = calc({ min: "1", max: "10", count: "20", duplicates: "allow" });
    const numbers = (result.primary.value as string).split(", ").map(Number);
    expect(numbers).toHaveLength(20);
    for (const n of numbers) {
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(10);
    }
  });

  it("generates unique numbers with no duplicates when requested", () => {
    const result = calc({ min: "1", max: "10", count: "10", duplicates: "unique" });
    const numbers = (result.primary.value as string).split(", ").map(Number);
    expect(new Set(numbers).size).toBe(10);
  });

  it("rejects requesting more unique numbers than exist in the range", () => {
    expect(() => randomNumberSchema.parse({ min: "1", max: "5", count: "10", duplicates: "unique" })).toThrow();
  });
});
