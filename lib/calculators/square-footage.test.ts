import { describe, it, expect } from "vitest";
import { squareFootageCalculator, squareFootageSchema } from "./square-footage";

function calc(input: Record<string, string>) {
  return squareFootageCalculator.calculate(squareFootageSchema.parse(input) as never);
}

describe("square footage calculator", () => {
  it("sums multiple rooms", () => {
    const result = calc({ length1: "10", width1: "10", length2: "5", width2: "5" });
    expect(result.primary.value).toBe(125);
  });

  it("computes total cost when price is given", () => {
    const result = calc({ length1: "10", width1: "10", pricePerSqFt: "5" });
    const cost = result.secondary.find((s) => s.key === "totalCost");
    expect(cost!.value).toBe(500);
  });
});
