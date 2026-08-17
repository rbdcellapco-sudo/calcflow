import { describe, it, expect } from "vitest";
import { salaryCalculator, salarySchema } from "./salary";

function calc(input: Record<string, string>) {
  return salaryCalculator.calculate(salarySchema.parse(input) as never);
}

describe("salary calculator", () => {
  it("computes monthly net pay", () => {
    const result = calc({ grossAnnualSalary: "1200000", estimatedTaxRate: "20", payFrequency: "monthly" });
    // net annual = 1200000*0.8=960000, /12=80000
    expect(result.primary.value).toBeCloseTo(80000, 2);
  });

  it("pre-tax deductions reduce taxable income", () => {
    const noDeduction = calc({ grossAnnualSalary: "1200000", estimatedTaxRate: "20", payFrequency: "annually" });
    const withDeduction = calc({ grossAnnualSalary: "1200000", estimatedTaxRate: "20", payFrequency: "annually", preTaxDeductionsAnnual: "100000" });
    expect(withDeduction.primary.value as number).toBeLessThan(noDeduction.primary.value as number);
  });
});
