import { describe, it, expect } from "vitest";
import { scientificNotationCalculator, scientificNotationSchema } from "./scientific-notation";

function calc(input: Record<string, string>) {
  return scientificNotationCalculator.calculate(scientificNotationSchema.parse(input) as never);
}

describe("scientific notation calculator", () => {
  it("converts a large number", () => {
    const result = calc({ value: "12345" });
    expect(result.primary.value).toBe("1.2345 × 10⁴");
  });

  it("converts a small decimal", () => {
    const result = calc({ value: "0.00456" });
    const exponent = result.secondary.find((s) => s.key === "exponent");
    expect(exponent!.value).toBe(-3);
  });

  it("handles zero", () => {
    const result = calc({ value: "0" });
    expect(result.primary.value).toBe("0 × 10⁰");
  });
});
