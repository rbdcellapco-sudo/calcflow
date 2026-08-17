import { describe, it, expect } from "vitest";
import { roiCalculator, roiSchema } from "./roi";

function calc(input: Record<string, string>) {
  return roiCalculator.calculate(roiSchema.parse(input) as never);
}

describe("roi calculator", () => {
  it("computes positive ROI", () => {
    const result = calc({ initialInvestment: "1000", finalValue: "1500" });
    expect(result.primary.value).toBeCloseTo(50, 2);
  });

  it("computes negative ROI for a loss", () => {
    const result = calc({ initialInvestment: "1000", finalValue: "800" });
    expect(result.primary.value).toBeCloseTo(-20, 2);
  });

  it("computes annualized ROI when years is provided", () => {
    const result = calc({ initialInvestment: "1000", finalValue: "1610.51", years: "5" });
    const annualized = result.secondary.find((s) => s.key === "annualizedRoi");
    expect(annualized).toBeDefined();
    expect(annualized!.value as number).toBeCloseTo(10, 0);
  });

  it("omits annualized ROI when years is not provided", () => {
    const result = calc({ initialInvestment: "1000", finalValue: "1500" });
    expect(result.secondary.find((s) => s.key === "annualizedRoi")).toBeUndefined();
  });
});
