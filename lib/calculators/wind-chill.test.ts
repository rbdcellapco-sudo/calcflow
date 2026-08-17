import { describe, it, expect } from "vitest";
import { windChillCalculator, windChillSchema } from "./wind-chill";

function calc(input: Record<string, string>) {
  return windChillCalculator.calculate(windChillSchema.parse(input) as never);
}

describe("wind chill calculator", () => {
  it("computes a wind chill colder than the actual temperature", () => {
    const result = calc({ tempF: "20", windMph: "15" });
    expect(result.primary.value as number).toBeLessThan(20);
  });

  it("returns actual temperature when conditions are out of range", () => {
    const result = calc({ tempF: "70", windMph: "15" });
    expect(result.primary.value).toBe(70);
  });
});
