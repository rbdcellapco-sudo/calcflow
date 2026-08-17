import { describe, it, expect } from "vitest";
import { cdCalculator, cdSchema } from "./cd";

function calc(input: Record<string, string>) {
  return cdCalculator.calculate(cdSchema.parse(input) as never);
}

describe("cd calculator", () => {
  it("computes maturity value for a 1-year term", () => {
    const result = calc({ deposit: "1000", apy: "5", termMonths: "12" });
    expect(result.primary.value).toBeCloseTo(1050, 2);
  });

  it("computes maturity value for a multi-year term", () => {
    const result = calc({ deposit: "1000", apy: "5", termMonths: "24" });
    // 1000 * 1.05^2 = 1102.5
    expect(result.primary.value).toBeCloseTo(1102.5, 2);
  });

  it("includes an early withdrawal penalty when provided", () => {
    const result = calc({ deposit: "1000", apy: "5", termMonths: "12", earlyWithdrawalPenaltyMonths: "3" });
    const penalty = result.secondary.find((s) => s.key === "penalty");
    expect(penalty).toBeDefined();
    expect(penalty!.value as number).toBeCloseTo(12.5, 2);
  });

  it("omits penalty fields when not provided", () => {
    const result = calc({ deposit: "1000", apy: "5", termMonths: "12" });
    expect(result.secondary.find((s) => s.key === "penalty")).toBeUndefined();
  });
});
