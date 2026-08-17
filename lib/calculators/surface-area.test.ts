import { describe, it, expect } from "vitest";
import { surfaceAreaCalculator, surfaceAreaSchema } from "./surface-area";

function calc(input: Record<string, string>) {
  return surfaceAreaCalculator.calculate(surfaceAreaSchema.parse(input) as never);
}

describe("surface area calculator", () => {
  it("computes cube surface area", () => {
    const result = calc({ shape: "cube", a: "3" });
    expect(result.primary.value).toBe(54);
  });

  it("computes sphere surface area", () => {
    const result = calc({ shape: "sphere", a: "3" });
    expect(result.primary.value as number).toBeCloseTo(113.097, 2);
  });
});
