import { describe, it, expect } from "vitest";
import { slopeCalculator, slopeSchema } from "./slope";

function calc(input: Record<string, string>) {
  return slopeCalculator.calculate(slopeSchema.parse(input) as never);
}

describe("slope calculator", () => {
  it("computes a positive slope", () => {
    const result = calc({ x1: "0", y1: "0", x2: "2", y2: "4" });
    expect(result.primary.value).toBe(2);
  });

  it("computes the distance between points", () => {
    const result = calc({ x1: "0", y1: "0", x2: "3", y2: "4" });
    const distance = result.secondary.find((s) => s.key === "distance");
    expect(distance!.value).toBe(5);
  });

  it("rejects a vertical line (undefined slope)", () => {
    expect(() => slopeSchema.parse({ x1: "2", y1: "0", x2: "2", y2: "5" })).toThrow();
  });
});
