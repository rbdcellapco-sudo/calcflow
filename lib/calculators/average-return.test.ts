import { describe, it, expect } from "vitest";
import { averageReturnCalculator, averageReturnSchema } from "./average-return";

function calc(input: Record<string, string>) {
  return averageReturnCalculator.calculate(averageReturnSchema.parse(input) as never);
}

describe("average return calculator", () => {
  it("geometric mean is negative for a 50% gain then 50% loss", () => {
    const result = calc({ year1: "50", year2: "-50" });
    expect(result.primary.value as number).toBeCloseTo(-13.4, 1);
  });

  it("arithmetic mean is zero for the same series", () => {
    const result = calc({ year1: "50", year2: "-50" });
    const arithmetic = result.secondary.find((s) => s.key === "arithmeticMean");
    expect(arithmetic!.value as number).toBeCloseTo(0, 5);
  });

  it("geometric mean is less than arithmetic mean when returns are volatile", () => {
    const result = calc({ year1: "40", year2: "-20", year3: "10" });
    const arithmetic = result.secondary.find((s) => s.key === "arithmeticMean")!.value as number;
    expect(result.primary.value as number).toBeLessThan(arithmetic);
  });
});
