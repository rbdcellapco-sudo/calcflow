import { describe, it, expect } from "vitest";
import { marginCalculator, marginSchema } from "./margin";

function calc(input: Record<string, string>) {
  return marginCalculator.calculate(marginSchema.parse(input) as never);
}

describe("margin calculator", () => {
  it("computes margin from cost and price", () => {
    const result = calc({ mode: "find-margin", cost: "60", value: "100" });
    expect(result.primary.value).toBeCloseTo(40, 2);
  });

  it("computes price from cost and target margin", () => {
    const result = calc({ mode: "find-price", cost: "60", value: "40" });
    expect(result.primary.value).toBeCloseTo(100, 2);
  });

  it("markup exceeds margin for the same sale", () => {
    const result = calc({ mode: "find-margin", cost: "60", value: "100" });
    const markup = result.secondary.find((s) => s.key === "markup");
    // markup = 40/60 = 66.67%, margin = 40%
    expect(markup!.value as number).toBeGreaterThan(result.primary.value as number);
  });
});
