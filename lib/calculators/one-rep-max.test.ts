import { describe, it, expect } from "vitest";
import { oneRepMaxCalculator, oneRepMaxSchema } from "./one-rep-max";

function calc(input: Record<string, string>) {
  return oneRepMaxCalculator.calculate(oneRepMaxSchema.parse(input) as never);
}

describe("one rep max calculator", () => {
  it("computes 1RM via Epley formula", () => {
    const result = calc({ weightLifted: "100", reps: "5" });
    // 100*(1+5/30) = 116.67
    expect(result.primary.value).toBeCloseTo(116.7, 1);
  });

  it("equals the weight lifted at 1 rep", () => {
    const result = calc({ weightLifted: "100", reps: "1" });
    expect(result.primary.value).toBeCloseTo(103.3, 1);
  });

  it("more reps at the same weight yields a higher estimated max", () => {
    const low = calc({ weightLifted: "100", reps: "3" });
    const high = calc({ weightLifted: "100", reps: "10" });
    expect(high.primary.value as number).toBeGreaterThan(low.primary.value as number);
  });
});
