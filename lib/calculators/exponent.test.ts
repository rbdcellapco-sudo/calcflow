import { describe, it, expect } from "vitest";
import { exponentCalculator, exponentSchema } from "./exponent";

function calc(input: Record<string, string>) {
  return exponentCalculator.calculate(exponentSchema.parse(input) as never);
}

describe("exponent calculator", () => {
  it("computes a positive integer exponent", () => {
    const result = calc({ base: "2", exponent: "10" });
    expect(result.primary.value).toBe(1024);
  });

  it("computes a negative exponent", () => {
    const result = calc({ base: "2", exponent: "-2" });
    expect(result.primary.value).toBe(0.25);
  });

  it("computes a fractional exponent", () => {
    const result = calc({ base: "9", exponent: "0.5" });
    expect(result.primary.value).toBe(3);
  });
});
