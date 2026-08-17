import { describe, it, expect } from "vitest";
import { salesTaxCalculator, salesTaxSchema } from "./sales-tax";

function calc(input: Record<string, string>) {
  return salesTaxCalculator.calculate(salesTaxSchema.parse(input) as never);
}

describe("sales tax calculator", () => {
  it("adds tax to a pre-tax amount", () => {
    const result = calc({ mode: "add", amount: "100", taxRate: "8" });
    expect(result.primary.value).toBeCloseTo(108, 2);
  });

  it("extracts tax from a total", () => {
    const result = calc({ mode: "extract", amount: "108", taxRate: "8" });
    expect(result.primary.value as number).toBeCloseTo(100, 2);
  });
});
