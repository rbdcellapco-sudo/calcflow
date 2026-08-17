import { describe, it, expect } from "vitest";
import { annuityCalculator, annuitySchema } from "./annuity";

function calc(input: Record<string, string>) {
  return annuityCalculator.calculate(annuitySchema.parse(input) as never);
}

describe("annuity calculator - accumulation", () => {
  it("computes future value of a regular contribution", () => {
    const result = calc({ mode: "accumulate", amount: "100", annualRate: "6", years: "10", frequency: "monthly" });
    expect(result.primary.value as number).toBeGreaterThan(100 * 12 * 10);
  });
});

describe("annuity calculator - payout", () => {
  it("computes a payout per period that fully exhausts the lump sum", () => {
    const result = calc({ mode: "payout", amount: "100000", annualRate: "5", years: "20", frequency: "monthly" });
    const totalPaidOut = result.secondary.find((s) => s.key === "totalPaidOut");
    expect(totalPaidOut!.value as number).toBeGreaterThan(100000);
    expect(result.primary.value as number).toBeGreaterThan(0);
  });

  it("payout per period increases with a higher interest rate", () => {
    const low = calc({ mode: "payout", amount: "100000", annualRate: "2", years: "20", frequency: "monthly" });
    const high = calc({ mode: "payout", amount: "100000", annualRate: "8", years: "20", frequency: "monthly" });
    expect(high.primary.value as number).toBeGreaterThan(low.primary.value as number);
  });
});
