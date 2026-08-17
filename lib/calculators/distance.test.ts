import { describe, it, expect } from "vitest";
import { distanceCalculator, distanceSchema } from "./distance";

function calc(input: Record<string, string>) {
  return distanceCalculator.calculate(distanceSchema.parse(input) as never);
}

describe("distance calculator", () => {
  it("computes 2D distance", () => {
    const result = calc({ x1: "0", y1: "0", x2: "3", y2: "4" });
    expect(result.primary.value).toBe(5);
  });

  it("computes 3D distance", () => {
    const result = calc({ x1: "0", y1: "0", x2: "2", y2: "3", z1: "0", z2: "6" });
    // sqrt(4+9+36) = sqrt(49) = 7
    expect(result.primary.value).toBe(7);
  });
});
