import { describe, it, expect } from "vitest";
import { btuCalculator, btuSchema } from "./btu";

function calc(input: Record<string, string>) {
  return btuCalculator.calculate(btuSchema.parse(input) as never);
}

describe("btu calculator", () => {
  it("computes higher BTU for worse insulation", () => {
    const good = calc({ roomLength: "12", roomWidth: "12", insulation: "good" });
    const poor = calc({ roomLength: "12", roomWidth: "12", insulation: "poor" });
    expect(poor.primary.value as number).toBeGreaterThan(good.primary.value as number);
  });
});
