import { describe, it, expect } from "vitest";
import { mortgageCalculator, mortgageSchema } from "./mortgage";

function calc(input: Record<string, string>) {
  return mortgageCalculator.calculate(mortgageSchema.parse(input) as never);
}

const base = {
  homePrice: "400000",
  downPayment: "80000",
  interestRate: "6",
  termYears: "30" as const,
  propertyTaxAnnual: "0",
  homeInsuranceAnnual: "0",
  pmiMonthly: "0",
  hoaMonthly: "0",
};

describe("mortgage calculator - normal case", () => {
  it("computes principal as home price minus down payment", () => {
    const result = calc(base);
    const loanAmount = result.secondary.find((s) => s.key === "loanAmount")!.value as number;
    expect(loanAmount).toBeCloseTo(320000, 2);
  });

  it("computes a sensible monthly P&I for a 30-year loan at 6%", () => {
    const result = calc(base);
    const monthlyPI = result.secondary.find((s) => s.key === "monthlyPI")!.value as number;
    expect(monthlyPI).toBeCloseTo(1918.56, 1);
  });
});

describe("mortgage calculator - taxes, insurance, PMI, HOA", () => {
  it("adds extra monthly costs into the total monthly payment", () => {
    const withExtras = calc({
      ...base,
      propertyTaxAnnual: "3600",
      homeInsuranceAnnual: "1200",
      pmiMonthly: "150",
      hoaMonthly: "50",
    });
    const withoutExtras = calc(base);
    expect(withExtras.primary.value).toBeGreaterThan(withoutExtras.primary.value as number);
    // 3600/12 + 1200/12 + 150 + 50 = 600 extra per month
    expect((withExtras.primary.value as number) - (withoutExtras.primary.value as number)).toBeCloseTo(600, 1);
  });
});

describe("mortgage calculator - boundary and invalid values", () => {
  it("rejects a down payment greater than or equal to the home price", () => {
    expect(() => mortgageSchema.parse({ ...base, downPayment: "400000" })).toThrow();
  });

  it("handles a zero down payment", () => {
    const result = calc({ ...base, downPayment: "0" });
    const loanAmount = result.secondary.find((s) => s.key === "loanAmount")!.value as number;
    expect(loanAmount).toBeCloseTo(400000, 2);
  });

  it("handles a 0% interest rate without dividing by zero", () => {
    const result = calc({ ...base, interestRate: "0" });
    expect(Number.isFinite(result.primary.value as number)).toBe(true);
  });
});
