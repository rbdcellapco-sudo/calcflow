import { describe, it, expect } from "vitest";
import { dewPointCalculator, dewPointSchema } from "./dew-point";

function calc(input: Record<string, string>) {
  return dewPointCalculator.calculate(dewPointSchema.parse(input) as never);
}

describe("dew point calculator", () => {
  it("computes a dew point below the actual temperature", () => {
    const result = calc({ tempF: "80", humidity: "60" });
    expect(result.primary.value as number).toBeLessThan(80);
  });

  it("higher humidity yields a higher dew point at the same temperature", () => {
    const dry = calc({ tempF: "80", humidity: "30" });
    const humid = calc({ tempF: "80", humidity: "80" });
    expect(humid.primary.value as number).toBeGreaterThan(dry.primary.value as number);
  });
});
