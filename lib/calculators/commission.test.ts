import { describe, it, expect } from "vitest";
import { commissionCalculator, commissionSchema } from "./commission";

function calc(input: Record<string, string>) {
  return commissionCalculator.calculate(commissionSchema.parse(input) as never);
}

describe("commission calculator", () => {
  it("computes flat-rate commission", () => {
    const result = calc({ saleAmount: "10000", commissionRate: "5" });
    expect(result.primary.value).toBeCloseTo(500, 2);
  });

  it("adds base salary to total pay", () => {
    const result = calc({ saleAmount: "10000", commissionRate: "5", baseSalary: "2000" });
    const total = result.secondary.find((s) => s.key === "totalPay");
    expect(total!.value as number).toBeCloseTo(2500, 2);
  });

  it("applies a higher tiered rate only above the threshold", () => {
    const result = calc({ saleAmount: "15000", commissionRate: "5", tieredThreshold: "10000", tieredRate: "10" });
    // 10000*5% + 5000*10% = 500+500=1000
    expect(result.primary.value).toBeCloseTo(1000, 2);
  });
});
