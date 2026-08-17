import { describe, it, expect } from "vitest";
import { rootCalculator, rootSchema } from "./root";

function calc(input: Record<string, string>) {
  return rootCalculator.calculate(rootSchema.parse(input) as never);
}

describe("root calculator", () => {
  it("computes a square root", () => {
    const result = calc({ value: "16", n: "2" });
    expect(result.primary.value).toBe(4);
  });

  it("computes a negative cube root", () => {
    const result = calc({ value: "-8", n: "3" });
    expect(result.primary.value).toBe(-2);
  });

  it("rejects an even root of a negative number", () => {
    expect(() => rootSchema.parse({ value: "-16", n: "2" })).toThrow();
  });
});
