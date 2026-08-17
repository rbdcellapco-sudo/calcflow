import { describe, it, expect } from "vitest";
import { matrixCalculator, matrixSchema } from "./matrix";

function calc(input: Record<string, string>) {
  return matrixCalculator.calculate(matrixSchema.parse(input) as never);
}

describe("matrix calculator", () => {
  it("computes the determinant", () => {
    const result = calc({ operation: "determinant", a11: "1", a12: "2", a21: "3", a22: "4" });
    // 1*4 - 2*3 = -2
    expect(result.primary.value).toBe(-2);
  });

  it("computes matrix multiplication", () => {
    const result = calc({
      operation: "multiply",
      a11: "1", a12: "2", a21: "3", a22: "4",
      b11: "5", b12: "6", b21: "7", b22: "8",
    });
    // [[1*5+2*7, 1*6+2*8],[3*5+4*7, 3*6+4*8]] = [[19,22],[43,50]]
    expect(result.primary.value).toBe("[19, 22] / [43, 50]");
  });

  it("computes the identity transpose unchanged", () => {
    const result = calc({ operation: "transpose", a11: "1", a12: "0", a21: "0", a22: "1" });
    expect(result.primary.value).toBe("[1, 0] / [0, 1]");
  });
});
