import { describe, it, expect } from "vitest";
import { areaCalculator, areaSchema } from "./area";

function calc(input: Record<string, string>) {
  return areaCalculator.calculate(areaSchema.parse(input) as never);
}

describe("area calculator", () => {
  it("computes rectangle area and perimeter", () => {
    const result = calc({ shape: "rectangle", a: "4", b: "5" });
    expect(result.primary.value).toBe(20);
    const perimeter = result.secondary.find((s) => s.key === "perimeter");
    expect(perimeter!.value).toBe(18);
  });

  it("computes circle area", () => {
    const result = calc({ shape: "circle", a: "3" });
    expect(result.primary.value as number).toBeCloseTo(28.274, 2);
  });

  it("computes triangle area", () => {
    const result = calc({ shape: "triangle", a: "6", b: "4" });
    expect(result.primary.value).toBe(12);
  });
});
