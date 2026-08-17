import { describe, it, expect } from "vitest";
import { studentLoanCalculator, studentLoanSchema } from "./student-loan";

function calc(input: Record<string, string>) {
  return studentLoanCalculator.calculate(studentLoanSchema.parse(input) as never);
}

describe("student loan calculator", () => {
  it("computes a monthly payment with no grace period", () => {
    const result = calc({ loanAmount: "30000", interestRate: "5", termYears: "10", gracePeriodMonths: "0" });
    expect(result.primary.value as number).toBeGreaterThan(0);
    expect(result.secondary.find((s) => s.key === "accruedDuringGrace")).toBeUndefined();
  });

  it("a grace period increases total interest paid", () => {
    const noGrace = calc({ loanAmount: "30000", interestRate: "5", termYears: "10", gracePeriodMonths: "0" });
    const withGrace = calc({ loanAmount: "30000", interestRate: "5", termYears: "10", gracePeriodMonths: "6" });
    const noGraceInterest = noGrace.secondary.find((s) => s.key === "totalInterest")!.value as number;
    const withGraceInterest = withGrace.secondary.find((s) => s.key === "totalInterest")!.value as number;
    expect(withGraceInterest).toBeGreaterThan(noGraceInterest);
  });
});
