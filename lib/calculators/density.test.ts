import { describe, it, expect } from "vitest";
import { densityCalculator, densitySchema } from "./density";

function calc(input: Record<string, string>) {
  return densityCalculator.calculate(densitySchema.parse(input) as never);
}

describe("density calculator", () => {
  it("solves for density", () => {
    const result = calc({ solveFor: "density", mass: "10", volume: "5" });
    expect(result.primary.value).toBe(2);
  });

  it("solves for mass", () => {
    const result = calc({ solveFor: "mass", density: "2", volume: "5" });
    expect(result.primary.value).toBe(10);
  });

  it("solves for volume", () => {
    const result = calc({ solveFor: "volume", mass: "10", density: "2" });
    expect(result.primary.value).toBe(5);
  });
});
