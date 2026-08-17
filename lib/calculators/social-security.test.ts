import { describe, it, expect } from "vitest";
import { socialSecurityCalculator, socialSecuritySchema } from "./social-security";

function calc(input: Record<string, string>) {
  return socialSecurityCalculator.calculate(socialSecuritySchema.parse(input) as never);
}

describe("social security calculator", () => {
  it("pays 100% at exactly full retirement age", () => {
    const result = calc({ fraBenefit: "2000", fullRetirementAge: "67", claimingAge: "67" });
    expect(result.primary.value).toBeCloseTo(2000, 2);
  });

  it("reduces the benefit for claiming early at 62 (5 years / 60 months before FRA 67)", () => {
    const result = calc({ fraBenefit: "2000", fullRetirementAge: "67", claimingAge: "62" });
    // 36 months * 5/9% + 24 months * 5/12% = 20% + 10% = 30% reduction => 1400
    expect(result.primary.value as number).toBeCloseTo(1400, 0);
  });

  it("increases the benefit for delaying to 70", () => {
    const result = calc({ fraBenefit: "2000", fullRetirementAge: "67", claimingAge: "70" });
    // 36 months * 2/3% = 24% increase => 2480
    expect(result.primary.value as number).toBeCloseTo(2480, 0);
  });

  it("delayed benefit exceeds full-retirement-age benefit", () => {
    const atFra = calc({ fraBenefit: "2000", fullRetirementAge: "67", claimingAge: "67" });
    const delayed = calc({ fraBenefit: "2000", fullRetirementAge: "67", claimingAge: "70" });
    expect(delayed.primary.value as number).toBeGreaterThan(atFra.primary.value as number);
  });
});
