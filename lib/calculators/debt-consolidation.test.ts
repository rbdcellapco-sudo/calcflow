import { describe, it, expect } from "vitest";
import { debtConsolidationCalculator, debtConsolidationSchema } from "./debt-consolidation";

function calc(input: Record<string, string>) {
  return debtConsolidationCalculator.calculate(debtConsolidationSchema.parse(input) as never);
}

describe("debt consolidation calculator", () => {
  it("computes a blended APR weighted by balance", () => {
    const result = calc({
      balance1: "3000", apr1: "24",
      balance2: "1000", apr2: "12",
      consolidationRate: "15", consolidationTermYears: "3",
    });
    // (3000*24 + 1000*12) / 4000 = (72000+12000)/4000 = 21
    const blended = result.secondary.find((s) => s.key === "currentBlendedApr");
    expect(blended!.value as number).toBeCloseTo(21, 1);
  });

  it("sums total debt across balances", () => {
    const result = calc({ balance1: "3000", apr1: "24", balance2: "1000", apr2: "12", consolidationRate: "15", consolidationTermYears: "3" });
    const totalDebt = result.secondary.find((s) => s.key === "totalDebt");
    expect(totalDebt!.value as number).toBeCloseTo(4000, 2);
  });
});
