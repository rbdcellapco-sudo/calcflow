import { describe, it, expect } from "vitest";
import { stairCalculator, stairSchema } from "./stair";

function calc(input: Record<string, string>) {
  return stairCalculator.calculate(stairSchema.parse(input) as never);
}

describe("stair calculator", () => {
  it("computes a reasonable number of steps", () => {
    const result = calc({ totalRise: "108", targetRiseHeight: "7.2" });
    // 108/7.2 = 15
    expect(result.primary.value).toBe(15);
  });

  it("flags a riser height outside code range", () => {
    const result = calc({ totalRise: "108", targetRiseHeight: "12" });
    expect(result.notes).toBeDefined();
  });
});
