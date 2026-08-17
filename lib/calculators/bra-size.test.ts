import { describe, it, expect } from "vitest";
import { braSizeCalculator, braSizeSchema } from "./bra-size";

function calc(input: Record<string, string>) {
  return braSizeCalculator.calculate(braSizeSchema.parse(input) as never);
}

describe("bra size calculator", () => {
  it("computes a size from band and bust measurements", () => {
    const result = calc({ unitSystem: "in", bandMeasurement: "32", bustMeasurement: "36" });
    expect(result.primary.value).toBe("32D");
  });
});
