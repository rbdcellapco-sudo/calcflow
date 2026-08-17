import { describe, it, expect } from "vitest";
import { gpaCalculator, gpaSchema } from "./gpa";

function calc(input: Record<string, string>) {
  return gpaCalculator.calculate(gpaSchema.parse(input) as never);
}

describe("gpa calculator", () => {
  it("computes GPA for two courses", () => {
    const result = calc({ grade1: "A", credits1: "3", grade2: "B", credits2: "3" });
    // (4.0*3 + 3.0*3) / 6 = 3.5
    expect(result.primary.value).toBe(3.5);
  });

  it("weights by credit hours", () => {
    const result = calc({ grade1: "A", credits1: "4", grade2: "C", credits2: "1" });
    // (4*4 + 2*1)/5 = 3.6
    expect(result.primary.value).toBeCloseTo(3.6, 5);
  });

  it("ignores unused optional course slots", () => {
    const result = calc({ grade1: "A", credits1: "3", grade2: "A", credits2: "3", grade3: "", credits3: "" });
    const totalCredits = result.secondary.find((s) => s.key === "totalCredits");
    expect(totalCredits!.value).toBe(6);
  });
});
