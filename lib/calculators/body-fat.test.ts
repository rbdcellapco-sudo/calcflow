import { describe, it, expect } from "vitest";
import { bodyFatCalculator, bodyFatSchema } from "./body-fat";

function calc(input: Record<string, string>) {
  return bodyFatCalculator.calculate(bodyFatSchema.parse(input) as never);
}

describe("body fat calculator", () => {
  it("computes male body fat percentage", () => {
    const result = calc({ unitSystem: "metric", gender: "male", height: "180", neck: "38", waist: "85" });
    expect(result.primary.value as number).toBeGreaterThan(0);
    expect(result.primary.value as number).toBeLessThan(50);
  });

  it("computes female body fat percentage with hip", () => {
    const result = calc({ unitSystem: "metric", gender: "female", height: "165", neck: "32", waist: "75", hip: "95" });
    expect(result.primary.value as number).toBeGreaterThan(0);
  });

  it("rejects a female entry missing hip measurement", () => {
    expect(() => bodyFatSchema.parse({ unitSystem: "metric", gender: "female", height: "165", neck: "32", waist: "75" })).toThrow();
  });

  it("rejects waist not greater than neck", () => {
    expect(() => bodyFatSchema.parse({ unitSystem: "metric", gender: "male", height: "180", neck: "40", waist: "35" })).toThrow();
  });
});
