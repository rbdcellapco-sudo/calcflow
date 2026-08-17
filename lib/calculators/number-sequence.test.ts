import { describe, it, expect } from "vitest";
import { numberSequenceCalculator, numberSequenceSchema } from "./number-sequence";

function calc(input: Record<string, string>) {
  return numberSequenceCalculator.calculate(numberSequenceSchema.parse(input) as never);
}

describe("number sequence calculator - arithmetic", () => {
  it("computes the nth term", () => {
    const result = calc({ sequenceType: "arithmetic", firstTerm: "2", step: "3", n: "5" });
    // 2,5,8,11,14
    expect(result.primary.value).toBe(14);
  });

  it("computes the sum of n terms", () => {
    const result = calc({ sequenceType: "arithmetic", firstTerm: "2", step: "3", n: "5" });
    const sum = result.secondary.find((s) => s.key === "sumOfN");
    expect(sum!.value).toBe(40); // 2+5+8+11+14
  });
});

describe("number sequence calculator - geometric", () => {
  it("computes the nth term", () => {
    const result = calc({ sequenceType: "geometric", firstTerm: "3", step: "2", n: "4" });
    // 3,6,12,24
    expect(result.primary.value).toBe(24);
  });
});
