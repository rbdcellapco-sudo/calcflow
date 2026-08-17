import { describe, it, expect } from "vitest";
import { factorCalculator, factorSchema } from "./factor";

function calc(input: Record<string, string>) {
  return factorCalculator.calculate(factorSchema.parse(input) as never);
}

describe("factor calculator", () => {
  it("lists all factors of a number", () => {
    const result = calc({ value: "24" });
    expect(result.primary.value).toBe("1, 2, 3, 4, 6, 8, 12, 24");
  });

  it("computes common factors with another number", () => {
    const result = calc({ value: "24", compareTo: "18" });
    const common = result.secondary.find((s) => s.key === "commonFactors");
    expect(common!.value).toBe("1, 2, 3, 6");
  });
});
