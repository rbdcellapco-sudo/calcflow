import { describe, it, expect } from "vitest";
import { romanNumeralCalculator, romanNumeralSchema } from "./roman-numeral";

function calc(input: Record<string, string>) {
  return romanNumeralCalculator.calculate(romanNumeralSchema.parse(input) as never);
}

describe("roman numeral converter", () => {
  it("converts a number to roman numerals", () => {
    const result = calc({ mode: "to-roman", value: "1994" });
    expect(result.primary.value).toBe("MCMXCIV");
  });

  it("converts roman numerals to a number", () => {
    const result = calc({ mode: "to-number", value: "MCMXCIV" });
    expect(result.primary.value).toBe(1994);
  });

  it("rejects a number out of range", () => {
    expect(() => romanNumeralSchema.parse({ mode: "to-roman", value: "4000" })).toThrow();
  });
});
