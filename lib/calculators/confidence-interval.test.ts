import { describe, it, expect } from "vitest";
import { confidenceIntervalCalculator, confidenceIntervalSchema } from "./confidence-interval";

function calc(input: Record<string, string>) {
  return confidenceIntervalCalculator.calculate(confidenceIntervalSchema.parse(input) as never);
}

describe("confidence interval calculator", () => {
  it("computes a wider interval for a higher confidence level", () => {
    const ci90 = calc({ sampleMean: "100", stdDev: "15", sampleSize: "30", confidenceLevel: "90" });
    const ci99 = calc({ sampleMean: "100", stdDev: "15", sampleSize: "30", confidenceLevel: "99" });
    const margin90 = ci90.secondary.find((s) => s.key === "marginOfError")!.value as number;
    const margin99 = ci99.secondary.find((s) => s.key === "marginOfError")!.value as number;
    expect(margin99).toBeGreaterThan(margin90);
  });

  it("a larger sample size narrows the interval", () => {
    const small = calc({ sampleMean: "100", stdDev: "15", sampleSize: "10", confidenceLevel: "95" });
    const large = calc({ sampleMean: "100", stdDev: "15", sampleSize: "1000", confidenceLevel: "95" });
    const marginSmall = small.secondary.find((s) => s.key === "marginOfError")!.value as number;
    const marginLarge = large.secondary.find((s) => s.key === "marginOfError")!.value as number;
    expect(marginLarge).toBeLessThan(marginSmall);
  });
});
