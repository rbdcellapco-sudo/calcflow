import { describe, it, expect } from "vitest";
import { debtPayoffCalculator, debtPayoffSchema } from "./debt-payoff";

function calc(input: Record<string, string>) {
  return debtPayoffCalculator.calculate(debtPayoffSchema.parse(input) as never);
}

describe("debt payoff calculator - single debt", () => {
  it("pays off a single debt and matches the starting balance", () => {
    const result = calc({ balance1: "5000", apr1: "20", minPayment1: "200" });
    const startingTotal = result.secondary.find((s) => s.key === "startingTotal");
    expect(startingTotal!.value as number).toBeCloseTo(5000, 2);
    const months = result.secondary.find((s) => s.key === "months");
    expect(months!.value as number).toBeGreaterThan(0);
  });
});

describe("debt payoff calculator - multiple debts", () => {
  it("sums starting balances across debts", () => {
    const result = calc({
      balance1: "3000", apr1: "22", minPayment1: "100",
      balance2: "2000", apr2: "15", minPayment2: "80",
    });
    const startingTotal = result.secondary.find((s) => s.key === "startingTotal");
    expect(startingTotal!.value as number).toBeCloseTo(5000, 2);
  });

  it("extra payments shorten the payoff time", () => {
    const noExtra = calc({
      balance1: "3000", apr1: "22", minPayment1: "100",
      balance2: "2000", apr2: "15", minPayment2: "80",
    });
    const withExtra = calc({
      balance1: "3000", apr1: "22", minPayment1: "100",
      balance2: "2000", apr2: "15", minPayment2: "80",
      extraPayment: "300",
    });
    const noExtraMonths = noExtra.secondary.find((s) => s.key === "months")!.value as number;
    const withExtraMonths = withExtra.secondary.find((s) => s.key === "months")!.value as number;
    expect(withExtraMonths).toBeLessThan(noExtraMonths);
  });
});
