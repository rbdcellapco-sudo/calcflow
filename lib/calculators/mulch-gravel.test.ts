import { describe, it, expect } from "vitest";
import { mulchGravelCalculator, mulchGravelSchema } from "./mulch-gravel";

function calc(input: Record<string, string>) {
  return mulchGravelCalculator.calculate(mulchGravelSchema.parse(input) as never);
}

describe("mulch and gravel calculator", () => {
  it("computes cubic yards needed", () => {
    const result = calc({ material: "mulch", length: "20", width: "10", depthInches: "3" });
    // 20*10*(3/12)=50 cu ft /27 = 1.85 cu yd
    expect(result.primary.value as number).toBeCloseTo(1.852, 2);
  });

  it("uses a smaller bag size for gravel than mulch", () => {
    const mulch = calc({ material: "mulch", length: "20", width: "10", depthInches: "3" });
    const gravel = calc({ material: "gravel", length: "20", width: "10", depthInches: "3" });
    const mulchBags = mulch.secondary.find((s) => s.key === "bagsNeeded")!.value as number;
    const gravelBags = gravel.secondary.find((s) => s.key === "bagsNeeded")!.value as number;
    expect(gravelBags).toBeGreaterThan(mulchBags);
  });
});
