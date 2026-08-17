import { describe, it, expect } from "vitest";
import { fractionCalculator, fractionSchema } from "./fraction";

function calc(input: Record<string, string>) {
  return fractionCalculator.calculate(fractionSchema.parse(input) as never);
}

describe("fraction calculator", () => {
  it("adds and simplifies fractions", () => {
    const result = calc({ num1: "1", den1: "2", op: "add", num2: "1", den2: "4" });
    expect(result.primary.value).toBe("3/4");
  });

  it("multiplies fractions", () => {
    const result = calc({ num1: "2", den1: "3", op: "multiply", num2: "3", den2: "4" });
    // 6/12 = 1/2
    expect(result.primary.value).toBe("1/2");
  });

  it("divides fractions", () => {
    const result = calc({ num1: "1", den1: "2", op: "divide", num2: "1", den2: "4" });
    expect(result.primary.value).toBe("2/1");
  });

  it("rejects a zero denominator", () => {
    expect(() => fractionSchema.parse({ num1: "1", den1: "0", op: "add", num2: "1", den2: "2" })).toThrow();
  });
});
