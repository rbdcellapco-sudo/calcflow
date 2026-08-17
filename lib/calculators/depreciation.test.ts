import { describe, it, expect } from "vitest";
import { depreciationCalculator, depreciationSchema } from "./depreciation";

function calc(input: Record<string, string>) {
  return depreciationCalculator.calculate(depreciationSchema.parse(input) as never);
}

describe("depreciation calculator - straight-line", () => {
  it("computes even annual depreciation", () => {
    const result = calc({ method: "straight-line", assetCost: "10000", salvageValue: "1000", usefulLifeYears: "9" });
    // (10000-1000)/9 = 1000
    expect(result.primary.value).toBeCloseTo(1000, 2);
    expect(result.table).toHaveLength(9);
  });
});

describe("depreciation calculator - declining balance", () => {
  it("front-loads larger depreciation in year 1", () => {
    const result = calc({ method: "declining-balance", assetCost: "10000", salvageValue: "1000", usefulLifeYears: "5" });
    // rate = 2/5 = 40%; year 1 = 10000*0.4 = 4000
    expect(result.primary.value).toBeCloseTo(4000, 2);
  });

  it("never depreciates book value below salvage value", () => {
    const result = calc({ method: "declining-balance", assetCost: "10000", salvageValue: "1000", usefulLifeYears: "5" });
    const lastRow = result.table![result.table!.length - 1];
    expect(lastRow.bookValue as number).toBeGreaterThanOrEqual(1000);
  });
});

describe("depreciation calculator - validation", () => {
  it("rejects a salvage value greater than the asset cost", () => {
    expect(() => depreciationSchema.parse({ method: "straight-line", assetCost: "1000", salvageValue: "2000", usefulLifeYears: "5" })).toThrow();
  });
});
