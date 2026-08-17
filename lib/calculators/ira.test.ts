import { describe, it, expect } from "vitest";
import { iraCalculator, iraSchema } from "./ira";

function calc(input: Record<string, string>) {
  return iraCalculator.calculate(iraSchema.parse(input) as never);
}

describe("ira calculator", () => {
  it("projects pre-tax growth", () => {
    const result = calc({ currentAge: "30", retirementAge: "65", currentBalance: "5000", annualContribution: "6000", annualReturn: "7" });
    expect(result.primary.value as number).toBeGreaterThan(5000);
  });

  it("computes an after-tax balance when a tax rate is provided", () => {
    const result = calc({ currentAge: "30", retirementAge: "65", currentBalance: "5000", annualContribution: "6000", annualReturn: "7", retirementTaxRate: "25" });
    const afterTax = result.secondary.find((s) => s.key === "afterTaxBalance");
    expect(afterTax).toBeDefined();
    expect(afterTax!.value as number).toBeLessThan(result.primary.value as number);
  });

  it("omits after-tax balance when no tax rate is given", () => {
    const result = calc({ currentAge: "30", retirementAge: "65", currentBalance: "5000", annualContribution: "6000", annualReturn: "7" });
    expect(result.secondary.find((s) => s.key === "afterTaxBalance")).toBeUndefined();
  });
});
