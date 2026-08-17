import { describe, it, expect } from "vitest";
import { probabilityCalculator, probabilitySchema } from "./probability";

function calc(input: Record<string, string>) {
  return probabilityCalculator.calculate(probabilitySchema.parse(input) as never);
}

describe("probability calculator", () => {
  it("computes independent AND probability", () => {
    const result = calc({ eventType: "independent-and", probA: "50", probB: "50" });
    expect(result.primary.value).toBe(25);
  });

  it("computes independent OR probability", () => {
    const result = calc({ eventType: "independent-or", probA: "50", probB: "50" });
    // 0.5+0.5-0.25=0.75
    expect(result.primary.value).toBe(75);
  });

  it("computes mutually exclusive OR probability", () => {
    const result = calc({ eventType: "mutually-exclusive-or", probA: "30", probB: "20" });
    expect(result.primary.value).toBe(50);
  });
});
