import { describe, it, expect } from "vitest";
import { overweightCalculator, overweightSchema } from "./overweight";

function calc(input: Record<string, string>) {
  return overweightCalculator.calculate(overweightSchema.parse(input) as never);
}

describe("overweight calculator", () => {
  it("reports within healthy range for a normal BMI", () => {
    const result = calc({ unitSystem: "metric", weight: "70", height: "175" });
    expect(result.primary.value).toBe("Within healthy range");
  });

  it("reports overweight status with an amount over", () => {
    const result = calc({ unitSystem: "metric", weight: "100", height: "170" });
    expect(result.primary.value).toBe("Overweight");
    const amount = result.secondary.find((s) => s.key === "amount");
    expect(amount!.value as number).toBeGreaterThan(0);
  });

  it("flags severely underweight with a note", () => {
    const result = calc({ unitSystem: "metric", weight: "40", height: "170" });
    expect(result.primary.value).toBe("Severely underweight");
    expect(result.notes).toBeDefined();
  });
});
