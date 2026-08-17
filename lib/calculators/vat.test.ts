import { describe, it, expect } from "vitest";
import { vatCalculator, vatSchema } from "./vat";

function calc(input: Record<string, string>) {
  return vatCalculator.calculate(vatSchema.parse(input) as never);
}

describe("vat calculator", () => {
  it("extracts VAT from a gross amount", () => {
    const result = calc({ mode: "extract", amount: "118", vatRate: "18" });
    expect(result.primary.value as number).toBeCloseTo(100, 2);
  });

  it("adds VAT to a net amount", () => {
    const result = calc({ mode: "add", amount: "100", vatRate: "18" });
    expect(result.primary.value).toBeCloseTo(118, 2);
  });
});
