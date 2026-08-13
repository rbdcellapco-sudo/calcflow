import { describe, it, expect } from "vitest";
import { tipCalculator, tipSchema } from "./tip";

function calc(input: Record<string, string>) {
  return tipCalculator.calculate(tipSchema.parse(input) as never);
}

describe("tip calculator", () => {
  it("computes a standard 18% tip for one person", () => {
    const result = calc({ billAmount: "100", tipPercent: "18", numPeople: "1" });
    expect(result.primary.value).toBeCloseTo(118, 10);
    const tipAmount = result.secondary.find((s) => s.key === "tipAmount")!;
    expect(tipAmount.value).toBeCloseTo(18, 10);
  });

  it("splits the bill evenly among multiple people", () => {
    const result = calc({ billAmount: "100", tipPercent: "20", numPeople: "4" });
    const perPerson = result.secondary.find((s) => s.key === "perPersonTotal")!;
    expect(perPerson.value).toBeCloseTo(30, 10);
  });

  it("handles a 0% tip", () => {
    const result = calc({ billAmount: "50", tipPercent: "0", numPeople: "1" });
    expect(result.primary.value).toBeCloseTo(50, 10);
  });

  it("rejects a negative bill amount", () => {
    expect(() => tipSchema.parse({ billAmount: "-10", tipPercent: "10", numPeople: "1" })).toThrow();
  });

  it("rejects zero people", () => {
    expect(() => tipSchema.parse({ billAmount: "10", tipPercent: "10", numPeople: "0" })).toThrow();
  });
});
