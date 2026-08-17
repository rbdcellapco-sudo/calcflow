import { describe, it, expect } from "vitest";
import { k401Calculator, k401Schema } from "./401k";

function calc(input: Record<string, string>) {
  return k401Calculator.calculate(k401Schema.parse(input) as never);
}

describe("401k calculator", () => {
  it("grows balance with employee contributions alone", () => {
    const result = calc({
      currentAge: "30", retirementAge: "65", currentBalance: "10000",
      annualSalary: "80000", contributionPercent: "6", annualReturn: "7",
    });
    expect(result.primary.value as number).toBeGreaterThan(10000);
  });

  it("employer match increases the balance vs. no match", () => {
    const noMatch = calc({
      currentAge: "30", retirementAge: "65", currentBalance: "10000",
      annualSalary: "80000", contributionPercent: "6", annualReturn: "7",
      employerMatchPercent: "0", employerMatchCap: "0",
    });
    const withMatch = calc({
      currentAge: "30", retirementAge: "65", currentBalance: "10000",
      annualSalary: "80000", contributionPercent: "6", annualReturn: "7",
      employerMatchPercent: "50", employerMatchCap: "6",
    });
    expect(withMatch.primary.value as number).toBeGreaterThan(noMatch.primary.value as number);
  });

  it("caps the matched contribution at the employer match cap", () => {
    const atCap = calc({
      currentAge: "30", retirementAge: "31", currentBalance: "0",
      annualSalary: "100000", contributionPercent: "10", annualReturn: "0",
      employerMatchPercent: "100", employerMatchCap: "6",
    });
    const employerContributed = atCap.secondary.find((s) => s.key === "totalEmployerContributed");
    // Employer matches 100% up to 6% of salary => 6% of 100000 = 6000
    expect(employerContributed!.value as number).toBeCloseTo(6000, 0);
  });
});
