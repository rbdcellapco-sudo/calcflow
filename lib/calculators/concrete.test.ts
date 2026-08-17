import { describe, it, expect } from "vitest";
import { concreteCalculator, concreteSchema } from "./concrete";

function calc(input: Record<string, string>) {
  return concreteCalculator.calculate(concreteSchema.parse(input) as never);
}

describe("concrete calculator", () => {
  it("computes cubic yards for a slab", () => {
    const result = calc({ length: "10", width: "10", thicknessInches: "4" });
    // 10*10*(4/12)=33.33 cu ft / 27 = 1.235 cu yd
    expect(result.primary.value as number).toBeCloseTo(1.235, 2);
  });
});
