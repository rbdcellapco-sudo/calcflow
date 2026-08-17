import { describe, it, expect } from "vitest";
import { creditCardPayoffCalculator, creditCardPayoffSchema } from "./credit-card-payoff";

function calc(input: Record<string, string>) {
  return creditCardPayoffCalculator.calculate(creditCardPayoffSchema.parse(input) as never);
}

describe("credit card payoff calculator", () => {
  it("computes months to payoff and total interest", () => {
    const result = calc({ balance: "5000", apr: "20", monthlyPayment: "200" });
    const months = result.secondary.find((s) => s.key === "months");
    expect(months!.value as number).toBeGreaterThan(0);
    const interest = result.secondary.find((s) => s.key === "totalInterest");
    expect(interest!.value as number).toBeGreaterThan(0);
  });

  it("a higher payment pays off faster", () => {
    const slow = calc({ balance: "5000", apr: "20", monthlyPayment: "150" });
    const fast = calc({ balance: "5000", apr: "20", monthlyPayment: "400" });
    const slowMonths = slow.secondary.find((s) => s.key === "months")!.value as number;
    const fastMonths = fast.secondary.find((s) => s.key === "months")!.value as number;
    expect(fastMonths).toBeLessThan(slowMonths);
  });

  it("rejects a payment that doesn't cover the monthly interest", () => {
    expect(() => creditCardPayoffSchema.parse({ balance: "5000", apr: "20", monthlyPayment: "50" })).toThrow();
  });
});
