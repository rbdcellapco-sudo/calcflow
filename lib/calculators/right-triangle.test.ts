import { describe, it, expect } from "vitest";
import { rightTriangleCalculator, rightTriangleSchema } from "./right-triangle";

function calc(input: Record<string, string>) {
  return rightTriangleCalculator.calculate(rightTriangleSchema.parse(input) as never);
}

describe("right triangle calculator", () => {
  it("computes the hypotenuse of a 3-4 triangle", () => {
    const result = calc({ mode: "two-legs", a: "3", b: "4" });
    expect(result.primary.value).toBe(5);
  });

  it("computes the missing leg given a leg and hypotenuse", () => {
    const result = calc({ mode: "leg-hypotenuse", a: "3", b: "5" });
    const legB = result.secondary.find((s) => s.key === "legB");
    expect(legB!.value).toBe(4);
  });

  it("rejects a hypotenuse shorter than the known leg", () => {
    expect(() => rightTriangleSchema.parse({ mode: "leg-hypotenuse", a: "10", b: "5" })).toThrow();
  });
});
