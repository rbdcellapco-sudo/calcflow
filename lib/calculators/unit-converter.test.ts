import { describe, it, expect } from "vitest";
import { unitConverterCalculator, unitConverterSchema } from "./unit-converter";

function calc(input: Record<string, string>) {
  return unitConverterCalculator.calculate(unitConverterSchema.parse(input) as never);
}

describe("unit converter", () => {
  it("converts meters to feet", () => {
    const result = calc({ fromUnit: "meter", value: "1", toUnit: "foot" });
    expect(result.primary.value as number).toBeCloseTo(3.28084, 4);
  });

  it("converts celsius to fahrenheit", () => {
    const result = calc({ fromUnit: "celsius", value: "100", toUnit: "fahrenheit" });
    expect(result.primary.value).toBe(212);
  });

  it("converts kilograms to pounds", () => {
    const result = calc({ fromUnit: "kilogram", value: "1", toUnit: "pound" });
    expect(result.primary.value as number).toBeCloseTo(2.20462, 4);
  });

  it("rejects converting across categories", () => {
    expect(() => unitConverterSchema.parse({ fromUnit: "meter", value: "1", toUnit: "kilogram" })).toThrow();
  });
});
