import { describe, it, expect } from "vitest";
import { downPaymentCalculator, downPaymentSchema } from "./down-payment";

function calc(input: Record<string, string>) {
  return downPaymentCalculator.calculate(downPaymentSchema.parse(input) as never);
}

describe("down payment calculator", () => {
  it("converts a percentage to an amount", () => {
    const result = calc({ mode: "percent", homePrice: "400000", value: "20" });
    expect(result.primary.value).toBeCloseTo(80000, 2);
    const loan = result.secondary.find((s) => s.key === "loanAmount");
    expect(loan!.value as number).toBeCloseTo(320000, 2);
  });

  it("converts an amount to a percentage", () => {
    const result = calc({ mode: "amount", homePrice: "400000", value: "80000" });
    const pct = result.secondary.find((s) => s.key === "downPaymentPercent");
    expect(pct!.value as number).toBeCloseTo(20, 2);
  });
});
