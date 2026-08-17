import { describe, it, expect } from "vitest";
import { mortgagePayoffCalculator, mortgagePayoffSchema } from "./mortgage-payoff";

function calc(input: Record<string, string>) {
  return mortgagePayoffCalculator.calculate(mortgagePayoffSchema.parse(input) as never);
}

describe("mortgage payoff calculator", () => {
  it("saves zero months with no extra payment", () => {
    const result = calc({ currentBalance: "250000", interestRate: "6", remainingTermYears: "25", extraMonthlyPayment: "0" });
    expect(result.primary.value).toBe(0);
  });

  it("extra payments save months and interest", () => {
    const result = calc({ currentBalance: "250000", interestRate: "6", remainingTermYears: "25", extraMonthlyPayment: "300" });
    expect(result.primary.value as number).toBeGreaterThan(0);
    const interestSaved = result.secondary.find((s) => s.key === "interestSaved");
    expect(interestSaved!.value as number).toBeGreaterThan(0);
  });

  it("bigger extra payments save more months", () => {
    const small = calc({ currentBalance: "250000", interestRate: "6", remainingTermYears: "25", extraMonthlyPayment: "100" });
    const big = calc({ currentBalance: "250000", interestRate: "6", remainingTermYears: "25", extraMonthlyPayment: "500" });
    expect(big.primary.value as number).toBeGreaterThan(small.primary.value as number);
  });
});
