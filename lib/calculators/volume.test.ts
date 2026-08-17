import { describe, it, expect } from "vitest";
import { volumeCalculator, volumeSchema } from "./volume";

function calc(input: Record<string, string>) {
  return volumeCalculator.calculate(volumeSchema.parse(input) as never);
}

describe("volume calculator", () => {
  it("computes cube volume", () => {
    const result = calc({ shape: "cube", a: "3" });
    expect(result.primary.value).toBe(27);
  });

  it("computes sphere volume", () => {
    const result = calc({ shape: "sphere", a: "3" });
    expect(result.primary.value as number).toBeCloseTo(113.097, 2);
  });

  it("computes cylinder volume", () => {
    const result = calc({ shape: "cylinder", a: "2", b: "5" });
    expect(result.primary.value as number).toBeCloseTo(62.832, 2);
  });
});
