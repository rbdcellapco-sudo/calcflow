import { describe, it, expect } from "vitest";
import { gfrCalculator, gfrSchema } from "./gfr";

function calc(input: Record<string, string>) {
  return gfrCalculator.calculate(gfrSchema.parse(input) as never);
}

describe("gfr calculator", () => {
  it("computes a normal eGFR for typical healthy creatinine", () => {
    const result = calc({ gender: "male", age: "30", creatinine: "0.9" });
    expect(result.primary.value as number).toBeGreaterThan(90);
  });

  it("higher creatinine yields lower eGFR", () => {
    const normal = calc({ gender: "male", age: "50", creatinine: "1.0" });
    const high = calc({ gender: "male", age: "50", creatinine: "2.5" });
    expect(high.primary.value as number).toBeLessThan(normal.primary.value as number);
  });

  it("classifies a low eGFR into a later-stage CKD category", () => {
    const result = calc({ gender: "female", age: "70", creatinine: "3.5" });
    const stage = result.secondary.find((s) => s.key === "stage");
    expect(stage!.value).toMatch(/G4|G5/);
  });
});
