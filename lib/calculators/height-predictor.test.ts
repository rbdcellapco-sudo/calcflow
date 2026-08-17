import { describe, it, expect } from "vitest";
import { heightPredictorCalculator, heightPredictorSchema } from "./height-predictor";

function calc(input: Record<string, string>) {
  return heightPredictorCalculator.calculate(heightPredictorSchema.parse(input) as never);
}

describe("height predictor calculator", () => {
  it("predicts a taller height for boys than girls with the same parents", () => {
    const boy = calc({ unitSystem: "metric", childGender: "boy", motherHeight: "165", fatherHeight: "180" });
    const girl = calc({ unitSystem: "metric", childGender: "girl", motherHeight: "165", fatherHeight: "180" });
    expect(boy.primary.value as number).toBeGreaterThan(girl.primary.value as number);
  });

  it("computes a range around the predicted height", () => {
    const result = calc({ unitSystem: "metric", childGender: "boy", motherHeight: "165", fatherHeight: "180" });
    const low = result.secondary.find((s) => s.key === "rangeLow")!.value as number;
    const high = result.secondary.find((s) => s.key === "rangeHigh")!.value as number;
    expect(result.primary.value as number).toBeGreaterThan(low);
    expect(result.primary.value as number).toBeLessThan(high);
  });
});
