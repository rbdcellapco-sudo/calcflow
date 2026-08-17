import { describe, it, expect } from "vitest";
import { autoLoanCalculator, autoLoanSchema } from "./auto-loan";

function calc(input: Record<string, string>) {
  return autoLoanCalculator.calculate(autoLoanSchema.parse(input) as never);
}

describe("auto loan calculator", () => {
  it("finances the full price with no trade-in or down payment", () => {
    const result = calc({ vehiclePrice: "30000", interestRate: "6", termMonths: "60" });
    const financed = result.secondary.find((s) => s.key === "amountFinanced");
    expect(financed!.value).toBeCloseTo(30000, 2);
  });

  it("reduces amount financed with a trade-in and down payment", () => {
    const result = calc({ vehiclePrice: "30000", downPayment: "3000", tradeInValue: "5000", interestRate: "6", termMonths: "60" });
    const financed = result.secondary.find((s) => s.key === "amountFinanced");
    expect(financed!.value as number).toBeCloseTo(22000, 2);
  });

  it("applies sales tax only after subtracting trade-in", () => {
    const result = calc({ vehiclePrice: "30000", tradeInValue: "10000", salesTaxRate: "10", interestRate: "6", termMonths: "60" });
    const tax = result.secondary.find((s) => s.key === "salesTax");
    // tax on (30000-10000) = 20000 * 10% = 2000
    expect(tax!.value as number).toBeCloseTo(2000, 2);
  });
});
