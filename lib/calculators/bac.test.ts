import { describe, it, expect } from "vitest";
import { bacCalculator, bacSchema } from "./bac";

function calc(input: Record<string, string>) {
  return bacCalculator.calculate(bacSchema.parse(input) as never);
}

describe("bac calculator", () => {
  it("computes a plausible BAC for 2 drinks", () => {
    const result = calc({ unitSystem: "metric", gender: "male", weight: "70", standardDrinks: "2", hoursElapsed: "0" });
    expect(result.primary.value as number).toBeGreaterThan(0.03);
    expect(result.primary.value as number).toBeLessThan(0.1);
  });

  it("more time elapsed reduces BAC", () => {
    const soon = calc({ unitSystem: "metric", gender: "male", weight: "70", standardDrinks: "3", hoursElapsed: "0" });
    const later = calc({ unitSystem: "metric", gender: "male", weight: "70", standardDrinks: "3", hoursElapsed: "3" });
    expect(later.primary.value as number).toBeLessThan(soon.primary.value as number);
  });

  it("never returns a negative BAC", () => {
    const result = calc({ unitSystem: "metric", gender: "male", weight: "70", standardDrinks: "1", hoursElapsed: "10" });
    expect(result.primary.value as number).toBeGreaterThanOrEqual(0);
  });

  it("always includes a driving safety warning", () => {
    const result = calc({ unitSystem: "metric", gender: "male", weight: "70", standardDrinks: "1", hoursElapsed: "1" });
    expect(result.notes?.some((n) => /driv/i.test(n))).toBe(true);
  });
});
