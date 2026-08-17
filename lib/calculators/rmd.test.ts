import { describe, it, expect } from "vitest";
import { rmdCalculator, rmdSchema } from "./rmd";

function calc(input: Record<string, string>) {
  return rmdCalculator.calculate(rmdSchema.parse(input) as never);
}

describe("rmd calculator", () => {
  it("computes RMD using the age-73 factor", () => {
    const result = calc({ age: "73", accountBalance: "265000" });
    // 265000 / 26.5 = 10000
    expect(result.primary.value).toBeCloseTo(10000, 0);
  });

  it("a higher age (shorter factor) yields a larger RMD for the same balance", () => {
    const younger = calc({ age: "75", accountBalance: "100000" });
    const older = calc({ age: "90", accountBalance: "100000" });
    expect(older.primary.value as number).toBeGreaterThan(younger.primary.value as number);
  });

  it("rejects an age below the RMD table's minimum", () => {
    expect(() => rmdSchema.parse({ age: "50", accountBalance: "100000" })).toThrow();
  });
});
