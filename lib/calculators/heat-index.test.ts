import { describe, it, expect } from "vitest";
import { heatIndexCalculator, heatIndexSchema } from "./heat-index";

function calc(input: Record<string, string>) {
  return heatIndexCalculator.calculate(heatIndexSchema.parse(input) as never);
}

describe("heat index calculator", () => {
  it("computes a heat index warmer than actual temperature at high humidity", () => {
    const result = calc({ tempF: "90", humidity: "70" });
    expect(result.primary.value as number).toBeGreaterThan(90);
  });

  it("returns actual temperature below 80F", () => {
    const result = calc({ tempF: "75", humidity: "70" });
    expect(result.primary.value).toBe(75);
  });
});
