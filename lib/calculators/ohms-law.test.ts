import { describe, it, expect } from "vitest";
import { ohmsLawCalculator, ohmsLawSchema } from "./ohms-law";

function calc(input: Record<string, string>) {
  return ohmsLawCalculator.calculate(ohmsLawSchema.parse(input) as never);
}

describe("ohms law calculator", () => {
  it("solves for voltage", () => {
    const result = calc({ solveFor: "voltage", current: "2", resistance: "5" });
    expect(result.primary.value).toBe(10);
  });

  it("solves for current", () => {
    const result = calc({ solveFor: "current", voltage: "10", resistance: "5" });
    expect(result.primary.value).toBe(2);
  });

  it("solves for resistance", () => {
    const result = calc({ solveFor: "resistance", voltage: "10", current: "2" });
    expect(result.primary.value).toBe(5);
  });

  it("computes power alongside the solved value", () => {
    const result = calc({ solveFor: "voltage", current: "2", resistance: "5" });
    const power = result.secondary.find((s) => s.key === "power");
    expect(power!.value).toBe(20);
  });
});
