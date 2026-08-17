import { describe, it, expect } from "vitest";
import { bodyTypeCalculator, bodyTypeSchema } from "./body-type";

function calc(input: Record<string, string>) {
  return bodyTypeCalculator.calculate(bodyTypeSchema.parse(input) as never);
}

describe("body type calculator", () => {
  it("classifies a large frame for a small wrist relative to height", () => {
    const result = calc({ unitSystem: "metric", gender: "male", height: "180", wrist: "20" });
    expect(result.primary.value).toBe("Large frame");
  });

  it("classifies a small frame for a large wrist relative to height", () => {
    const result = calc({ unitSystem: "metric", gender: "male", height: "160", wrist: "14" });
    expect(result.primary.value).toBe("Small frame");
  });
});
