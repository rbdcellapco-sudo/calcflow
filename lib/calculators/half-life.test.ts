import { describe, it, expect } from "vitest";
import { halfLifeCalculator, halfLifeSchema } from "./half-life";

function calc(input: Record<string, string>) {
  return halfLifeCalculator.calculate(halfLifeSchema.parse(input) as never);
}

describe("half-life calculator", () => {
  it("halves the amount after one half-life", () => {
    const result = calc({ initialAmount: "100", halfLife: "10", elapsedTime: "10" });
    expect(result.primary.value).toBe(50);
  });

  it("quarters the amount after two half-lives", () => {
    const result = calc({ initialAmount: "100", halfLife: "10", elapsedTime: "20" });
    expect(result.primary.value).toBe(25);
  });

  it("leaves the amount unchanged at zero elapsed time", () => {
    const result = calc({ initialAmount: "100", halfLife: "10", elapsedTime: "0" });
    expect(result.primary.value).toBe(100);
  });
});
