import { describe, it, expect } from "vitest";
import { sampleSizeCalculator, sampleSizeSchema } from "./sample-size";

function calc(input: Record<string, string>) {
  return sampleSizeCalculator.calculate(sampleSizeSchema.parse(input) as never);
}

describe("sample size calculator", () => {
  it("computes a standard 95% confidence sample size", () => {
    const result = calc({ confidenceLevel: "95", marginOfError: "5", populationProportion: "50" });
    // z=1.96, p=0.5, e=0.05 -> n = 1.96^2*0.25/0.0025 = 384.16 -> ceil 385
    expect(result.primary.value).toBe(385);
  });

  it("finite population correction reduces required sample size", () => {
    const result = calc({ confidenceLevel: "95", marginOfError: "5", populationProportion: "50", populationSize: "500" });
    expect(result.primary.value as number).toBeLessThan(385);
  });

  it("a tighter margin of error requires a larger sample", () => {
    const loose = calc({ confidenceLevel: "95", marginOfError: "10", populationProportion: "50" });
    const tight = calc({ confidenceLevel: "95", marginOfError: "2", populationProportion: "50" });
    expect(tight.primary.value as number).toBeGreaterThan(loose.primary.value as number);
  });
});
