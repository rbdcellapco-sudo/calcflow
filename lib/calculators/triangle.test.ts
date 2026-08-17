import { describe, it, expect } from "vitest";
import { triangleCalculator, triangleSchema } from "./triangle";

function calc(input: Record<string, string>) {
  return triangleCalculator.calculate(triangleSchema.parse(input) as never);
}

describe("triangle calculator - sss", () => {
  it("computes area of a 3-4-5 right triangle", () => {
    const result = calc({ mode: "sss", a: "3", b: "4", c: "5" });
    expect(result.primary.value).toBeCloseTo(6, 3);
    const angleC = result.secondary.find((s) => s.key === "angleC");
    expect(angleC!.value as number).toBeCloseTo(90, 1);
  });

  it("rejects sides that can't form a triangle", () => {
    expect(() => calc({ mode: "sss", a: "1", b: "1", c: "10" })).toThrow();
  });
});

describe("triangle calculator - asa", () => {
  it("angles sum to 180", () => {
    const result = calc({ mode: "asa", a: "60", b: "10", c: "60" });
    const angleB = result.secondary.find((s) => s.key === "angleB");
    expect((60 + 60 + (angleB!.value as number))).toBeCloseTo(180, 5);
  });
});
