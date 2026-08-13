import { describe, it, expect } from "vitest";
import { bmiCalculator, bmiSchema, bmiCategory } from "./bmi";

function calc(input: Record<string, string>) {
  return bmiCalculator.calculate(bmiSchema.parse(input) as never);
}

describe("bmi calculator - metric", () => {
  it("computes a normal-weight BMI", () => {
    const result = calc({ unitSystem: "metric", weight: "70", height: "175" });
    expect(result.primary.value).toBeCloseTo(22.86, 2);
  });
});

describe("bmi calculator - imperial", () => {
  it("computes BMI using the 703 conversion factor", () => {
    const result = calc({ unitSystem: "imperial", weight: "154", height: "69" });
    expect(result.primary.value).toBeCloseTo(22.74, 1);
  });
});

describe("bmiCategory", () => {
  it("classifies underweight", () => {
    expect(bmiCategory(17)).toBe("Underweight");
  });
  it("classifies normal weight", () => {
    expect(bmiCategory(22)).toBe("Normal weight");
  });
  it("classifies overweight", () => {
    expect(bmiCategory(27)).toBe("Overweight");
  });
  it("classifies obese", () => {
    expect(bmiCategory(32)).toBe("Obese");
  });
  it("handles boundary values correctly", () => {
    expect(bmiCategory(18.5)).toBe("Normal weight");
    expect(bmiCategory(25)).toBe("Overweight");
    expect(bmiCategory(30)).toBe("Obese");
  });
});

describe("bmi calculator - invalid input", () => {
  it("rejects zero weight", () => {
    expect(() => bmiSchema.parse({ unitSystem: "metric", weight: "0", height: "175" })).toThrow();
  });
});
