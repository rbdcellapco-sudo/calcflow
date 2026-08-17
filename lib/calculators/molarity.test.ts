import { describe, it, expect } from "vitest";
import { molarityCalculator, molaritySchema } from "./molarity";

function calc(input: Record<string, string>) {
  return molarityCalculator.calculate(molaritySchema.parse(input) as never);
}

describe("molarity calculator", () => {
  it("solves for molarity", () => {
    const result = calc({ solveFor: "molarity", moles: "2", volumeLiters: "4" });
    expect(result.primary.value).toBe(0.5);
  });

  it("solves for moles", () => {
    const result = calc({ solveFor: "moles", molarity: "0.5", volumeLiters: "4" });
    expect(result.primary.value).toBe(2);
  });
});
