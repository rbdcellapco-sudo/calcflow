import { describe, it, expect } from "vitest";
import { horsepowerCalculator, horsepowerSchema } from "./horsepower";

function calc(input: Record<string, string>) {
  return horsepowerCalculator.calculate(horsepowerSchema.parse(input) as never);
}

describe("horsepower calculator", () => {
  it("computes a plausible horsepower for a typical car", () => {
    const result = calc({ weight: "3200", quarterMileMph: "100" });
    expect(result.primary.value as number).toBeCloseTo(250, 0);
  });

  it("higher trap speed yields higher horsepower", () => {
    const slow = calc({ weight: "3200", quarterMileMph: "80" });
    const fast = calc({ weight: "3200", quarterMileMph: "120" });
    expect(fast.primary.value as number).toBeGreaterThan(slow.primary.value as number);
  });
});
