import { describe, it, expect } from "vitest";
import { bodySurfaceAreaCalculator, bodySurfaceAreaSchema } from "./body-surface-area";

function calc(input: Record<string, string>) {
  return bodySurfaceAreaCalculator.calculate(bodySurfaceAreaSchema.parse(input) as never);
}

describe("body surface area calculator", () => {
  it("computes a plausible adult BSA (around 1.7-2.0 m²)", () => {
    const result = calc({ unitSystem: "metric", weight: "70", height: "170" });
    expect(result.primary.value as number).toBeGreaterThan(1.5);
    expect(result.primary.value as number).toBeLessThan(2.2);
  });

  it("DuBois and Mosteller give similar results", () => {
    const result = calc({ unitSystem: "metric", weight: "70", height: "170" });
    const mosteller = result.secondary.find((s) => s.key === "mosteller")!.value as number;
    expect(Math.abs((result.primary.value as number) - mosteller)).toBeLessThan(0.15);
  });
});
