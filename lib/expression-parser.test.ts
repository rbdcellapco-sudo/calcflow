import { describe, it, expect } from "vitest";
import { evaluateExpression, ExpressionError } from "./expression-parser";

describe("evaluateExpression - operator precedence", () => {
  it("respects standard precedence (multiplication before addition)", () => {
    expect(evaluateExpression("2 + 3 * 4")).toBe(14);
  });

  it("respects exponent precedence over multiplication", () => {
    expect(evaluateExpression("2 * 3 ^ 2")).toBe(18);
  });

  it("is right-associative for exponents", () => {
    expect(evaluateExpression("2 ^ 3 ^ 2")).toBe(2 ** (3 ** 2));
  });

  it("handles unary minus correctly", () => {
    expect(evaluateExpression("-5 + 3")).toBe(-2);
    expect(evaluateExpression("3 - -5")).toBe(8);
  });
});

describe("evaluateExpression - brackets", () => {
  it("evaluates parenthesized expressions first", () => {
    expect(evaluateExpression("(2 + 3) * 4")).toBe(20);
  });

  it("supports nested parentheses", () => {
    expect(evaluateExpression("((2 + 3) * (4 - 1))")).toBe(15);
  });

  it("supports implicit multiplication before a parenthesis", () => {
    expect(evaluateExpression("2(3+4)")).toBe(14);
  });
});

describe("evaluateExpression - trig and deg/rad", () => {
  it("computes sin(90) in degree mode as 1", () => {
    expect(evaluateExpression("sin(90)", "deg")).toBeCloseTo(1, 10);
  });

  it("computes sin(pi/2) in radian mode as 1", () => {
    expect(evaluateExpression("sin(pi/2)", "rad")).toBeCloseTo(1, 10);
  });

  it("computes cos(0) as 1 regardless of mode", () => {
    expect(evaluateExpression("cos(0)", "deg")).toBeCloseTo(1, 10);
    expect(evaluateExpression("cos(0)", "rad")).toBeCloseTo(1, 10);
  });

  it("computes tan(45) in degree mode as 1", () => {
    expect(evaluateExpression("tan(45)", "deg")).toBeCloseTo(1, 10);
  });
});

describe("evaluateExpression - functions and constants", () => {
  it("computes square root", () => {
    expect(evaluateExpression("sqrt(16)")).toBe(4);
  });

  it("computes natural log and log base 10", () => {
    expect(evaluateExpression("ln(e)")).toBeCloseTo(1, 10);
    expect(evaluateExpression("log(100)")).toBeCloseTo(2, 10);
  });

  it("computes factorial", () => {
    expect(evaluateExpression("5!")).toBe(120);
  });

  it("computes percentage postfix operator", () => {
    expect(evaluateExpression("50%")).toBeCloseTo(0.5, 10);
  });
});

describe("evaluateExpression - float edge cases", () => {
  it("handles decimals accurately enough for display", () => {
    expect(evaluateExpression("0.1 + 0.2")).toBeCloseTo(0.3, 10);
  });

  it("handles scientific notation", () => {
    expect(evaluateExpression("1.5e2")).toBe(150);
  });

  it("handles very small numbers", () => {
    expect(evaluateExpression("1e-5")).toBeCloseTo(0.00001, 10);
  });
});

describe("evaluateExpression - error handling (no eval, no crashes)", () => {
  it("throws ExpressionError on division by zero", () => {
    expect(() => evaluateExpression("5 / 0")).toThrow(ExpressionError);
  });

  it("throws ExpressionError on empty input", () => {
    expect(() => evaluateExpression("")).toThrow(ExpressionError);
  });

  it("throws ExpressionError on invalid characters", () => {
    expect(() => evaluateExpression("2 + alert(1)")).toThrow();
  });

  it("throws ExpressionError on unbalanced parentheses", () => {
    expect(() => evaluateExpression("(2 + 3")).toThrow(ExpressionError);
  });

  it("throws ExpressionError on negative square root", () => {
    expect(() => evaluateExpression("sqrt(-4)")).toThrow(ExpressionError);
  });
});
