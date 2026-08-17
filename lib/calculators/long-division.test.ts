import { describe, it, expect } from "vitest";
import { longDivisionCalculator, longDivisionSchema } from "./long-division";

function calc(input: Record<string, string>) {
  return longDivisionCalculator.calculate(longDivisionSchema.parse(input) as never);
}

describe("long division calculator", () => {
  it("computes quotient and remainder", () => {
    const result = calc({ dividend: "17", divisor: "5" });
    expect(result.primary.value).toBe(3);
    const remainder = result.secondary.find((s) => s.key === "remainder");
    expect(remainder!.value).toBe(2);
  });

  it("computes the exact decimal result", () => {
    const result = calc({ dividend: "10", divisor: "4" });
    const decimal = result.secondary.find((s) => s.key === "decimal");
    expect(decimal!.value).toBe(2.5);
  });

  it("rejects division by zero", () => {
    expect(() => longDivisionSchema.parse({ dividend: "10", divisor: "0" })).toThrow();
  });
});
