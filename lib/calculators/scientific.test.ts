import { describe, it, expect } from "vitest";
import { scientificCalculator, scientificSchema } from "./scientific";

describe("scientific calculator wrapper", () => {
  it("evaluates a basic expression end-to-end through calculate()", () => {
    const values = scientificSchema.parse({ expression: "2 + 2 * 2", angleMode: "deg" });
    const result = scientificCalculator.calculate(values as never);
    expect(result.primary.value).toBe(6);
  });

  it("respects the selected angle mode", () => {
    const deg = scientificCalculator.calculate(
      scientificSchema.parse({ expression: "sin(90)", angleMode: "deg" }) as never
    );
    expect(deg.primary.value as number).toBeCloseTo(1, 10);
  });

  it("rejects an empty expression via schema validation", () => {
    expect(() => scientificSchema.parse({ expression: "", angleMode: "deg" })).toThrow();
  });

  it("surfaces a clear error for invalid syntax instead of crashing", () => {
    const values = scientificSchema.parse({ expression: "2 + 3)", angleMode: "deg" });
    expect(() => scientificCalculator.calculate(values as never)).toThrow();
  });
});
