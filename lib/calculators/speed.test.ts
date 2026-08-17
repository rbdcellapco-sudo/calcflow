import { describe, it, expect } from "vitest";
import { speedCalculator, speedSchema } from "./speed";

function calc(input: Record<string, string>) {
  return speedCalculator.calculate(speedSchema.parse(input) as never);
}

describe("speed calculator", () => {
  it("solves for speed", () => {
    const result = calc({ solveFor: "speed", distance: "100", time: "2" });
    expect(result.primary.value).toBe(50);
  });

  it("solves for distance", () => {
    const result = calc({ solveFor: "distance", speed: "50", time: "2" });
    expect(result.primary.value).toBe(100);
  });

  it("solves for time", () => {
    const result = calc({ solveFor: "time", distance: "100", speed: "50" });
    expect(result.primary.value).toBe(2);
  });
});
