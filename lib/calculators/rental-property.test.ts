import { describe, it, expect } from "vitest";
import { rentalPropertyCalculator, rentalPropertySchema } from "./rental-property";

function calc(input: Record<string, string>) {
  return rentalPropertyCalculator.calculate(rentalPropertySchema.parse(input) as never);
}

describe("rental property calculator", () => {
  it("computes positive cash flow when rent comfortably exceeds costs", () => {
    const result = calc({
      purchasePrice: "200000", downPaymentPercent: "25", interestRate: "6", termYears: "30",
      monthlyRentIncome: "2200", monthlyExpenses: "300",
    });
    expect(result.primary.value as number).toBeGreaterThan(0);
  });

  it("vacancy rate reduces cash flow", () => {
    const noVacancy = calc({
      purchasePrice: "200000", downPaymentPercent: "25", interestRate: "6", termYears: "30",
      monthlyRentIncome: "2200", monthlyExpenses: "300", vacancyRate: "0",
    });
    const withVacancy = calc({
      purchasePrice: "200000", downPaymentPercent: "25", interestRate: "6", termYears: "30",
      monthlyRentIncome: "2200", monthlyExpenses: "300", vacancyRate: "10",
    });
    expect(withVacancy.primary.value as number).toBeLessThan(noVacancy.primary.value as number);
  });

  it("computes a cap rate independent of financing", () => {
    const result = calc({
      purchasePrice: "200000", downPaymentPercent: "25", interestRate: "6", termYears: "30",
      monthlyRentIncome: "2200", monthlyExpenses: "300",
    });
    const capRate = result.secondary.find((s) => s.key === "capRate");
    expect(capRate!.value as number).toBeGreaterThan(0);
  });
});
