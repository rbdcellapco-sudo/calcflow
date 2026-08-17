import { describe, it, expect } from "vitest";
import { futureValueCalculator, futureValueSchema } from "./future-value";

function calc(input: Record<string, string>) {
  return futureValueCalculator.calculate(futureValueSchema.parse(input) as never);
}

describe("future value calculator", () => {
  it("matches compound growth with no contributions", () => {
    const result = calc({ presentValue: "1000", contribution: "0", annualRate: "5", years: "10", frequency: "annually", timing: "end" });
    expect(result.primary.value).toBeCloseTo(1628.89, 1);
  });

  it("beginning-of-period contributions grow more than end-of-period", () => {
    const end = calc({ presentValue: "0", contribution: "100", annualRate: "5", years: "10", frequency: "monthly", timing: "end" });
    const beginning = calc({ presentValue: "0", contribution: "100", annualRate: "5", years: "10", frequency: "monthly", timing: "beginning" });
    expect(beginning.primary.value as number).toBeGreaterThan(end.primary.value as number);
  });

  it("handles zero rate as simple accumulation", () => {
    const result = calc({ presentValue: "1000", contribution: "50", annualRate: "0", years: "2", frequency: "monthly", timing: "end" });
    expect(result.primary.value).toBeCloseTo(1000 + 50 * 24, 2);
  });
});
