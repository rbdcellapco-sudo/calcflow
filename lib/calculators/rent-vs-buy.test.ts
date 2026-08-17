import { describe, it, expect } from "vitest";
import { rentVsBuyCalculator, rentVsBuySchema } from "./rent-vs-buy";

function calc(input: Record<string, string>) {
  return rentVsBuyCalculator.calculate(rentVsBuySchema.parse(input) as never);
}

describe("rent vs buy calculator", () => {
  it("favors buying over a long horizon with cheap rent-equivalent mortgage", () => {
    const result = calc({
      homePrice: "300000", downPayment: "60000", interestRate: "5", termYears: "30",
      monthlyRent: "2500", yearsToCompare: "20",
    });
    expect(result.primary.value).toBe("Buying");
  });

  it("favors renting over a very short horizon with no home appreciation", () => {
    const result = calc({
      homePrice: "300000", downPayment: "60000", interestRate: "7", termYears: "30",
      monthlyRent: "1200", yearsToCompare: "1", homeAppreciationRate: "0",
    });
    expect(result.primary.value).toBe("Renting");
  });

  it("computes positive home equity at the end of the period", () => {
    const result = calc({
      homePrice: "300000", downPayment: "60000", interestRate: "5", termYears: "30",
      monthlyRent: "2000", yearsToCompare: "10",
    });
    const equity = result.secondary.find((s) => s.key === "netEquityAtEnd");
    expect(equity!.value as number).toBeGreaterThan(0);
  });
});
