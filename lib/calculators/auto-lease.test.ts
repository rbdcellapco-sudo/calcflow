import { describe, it, expect } from "vitest";
import { autoLeaseCalculator, autoLeaseSchema } from "./auto-lease";

function calc(input: Record<string, string>) {
  return autoLeaseCalculator.calculate(autoLeaseSchema.parse(input) as never);
}

describe("auto lease calculator", () => {
  it("computes a monthly payment combining depreciation and finance fees", () => {
    const result = calc({ vehiclePrice: "30000", residualPercent: "55", annualRate: "3", termMonths: "36" });
    expect(result.primary.value as number).toBeGreaterThan(0);
  });

  it("a higher residual value lowers the monthly payment", () => {
    const lowResidual = calc({ vehiclePrice: "30000", residualPercent: "40", annualRate: "3", termMonths: "36" });
    const highResidual = calc({ vehiclePrice: "30000", residualPercent: "65", annualRate: "3", termMonths: "36" });
    expect(highResidual.primary.value as number).toBeLessThan(lowResidual.primary.value as number);
  });

  it("a down payment lowers the monthly payment", () => {
    const noDown = calc({ vehiclePrice: "30000", residualPercent: "55", annualRate: "3", termMonths: "36" });
    const withDown = calc({ vehiclePrice: "30000", downPayment: "3000", residualPercent: "55", annualRate: "3", termMonths: "36" });
    expect(withDown.primary.value as number).toBeLessThan(noDown.primary.value as number);
  });
});
