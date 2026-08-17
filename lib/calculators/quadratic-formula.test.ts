import { describe, it, expect } from "vitest";
import { quadraticFormulaCalculator, quadraticFormulaSchema } from "./quadratic-formula";

function calc(input: Record<string, string>) {
  return quadraticFormulaCalculator.calculate(quadraticFormulaSchema.parse(input) as never);
}

describe("quadratic formula calculator", () => {
  it("solves for two real roots", () => {
    // x^2 - 3x + 2 = 0 -> roots 2 and 1
    const result = calc({ a: "1", b: "-3", c: "2" });
    expect(result.primary.value).toBe("x = 2, x = 1");
  });

  it("solves for one repeated root", () => {
    // x^2 - 4x + 4 = 0 -> root 2 (repeated)
    const result = calc({ a: "1", b: "-4", c: "4" });
    expect(result.primary.value).toBe("x = 2");
  });

  it("reports complex roots when discriminant is negative", () => {
    // x^2 + x + 1 = 0
    const result = calc({ a: "1", b: "1", c: "1" });
    expect(result.notes?.[0]).toMatch(/complex/i);
  });

  it("rejects a of zero", () => {
    expect(() => quadraticFormulaSchema.parse({ a: "0", b: "1", c: "1" })).toThrow();
  });
});
